from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.messaging import ConnectionStatus as MessageConnectionStatus
from app.models.notification import Notification, NotifType
from app.models.user import User, UserRole
from app.repositories import applications as applications_repository
from app.repositories import blueprints as blueprints_repository
from app.repositories import messages as messages_repository
from app.repositories import notifications as notifications_repository
from app.repositories import users as users_repository
from app.schemas.messages import MessageResponse
from app.services.notification_preferences import (
    DEFAULT_NOTIFICATION_PREFERENCES,
    normalize_preferences,
)
from app.services.exceptions import (
    NotificationAccessDeniedError,
    NotificationNotFoundError,
    NotificationPersistenceError,
)

logger = logging.getLogger(__name__)


def list_notifications(
    db: Session, current_user: User, *, limit: int, offset: int
) -> tuple[list[Notification], int]:
    return notifications_repository.list_notifications_for_user(
        db, current_user.id, limit=limit, offset=offset
    )


def get_preferences(current_user: User) -> dict[str, bool]:
    return normalize_preferences(current_user.notification_preferences)


def update_preferences(
    db: Session, current_user: User, preferences: dict[str, bool]
) -> dict[str, bool]:
    current_user.notification_preferences = {
        **normalize_preferences(current_user.notification_preferences),
        **preferences,
    }
    try:
        db.commit()
        db.refresh(current_user)
    except SQLAlchemyError as exc:
        db.rollback()
        raise NotificationPersistenceError("Notification preferences could not be saved.") from exc
    return get_preferences(current_user)


def mark_read(db: Session, notification_id: UUID, current_user: User) -> Notification:
    notification = notifications_repository.get_notification_by_id(db, notification_id)
    if notification is None:
        raise NotificationNotFoundError()
    if notification.user_id != current_user.id:
        raise NotificationAccessDeniedError()

    try:
        notifications_repository.mark_notification_read(db, notification)
        db.commit()
        db.refresh(notification)
    except SQLAlchemyError as exc:
        db.rollback()
        raise NotificationPersistenceError("Notification could not be updated.") from exc

    return notification


def mark_all_read(db: Session, current_user: User) -> None:
    try:
        notifications_repository.mark_all_read_for_user(db, current_user.id)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise NotificationPersistenceError("Notifications could not be updated.") from exc


def notify_message_event(
    db: Session, *, message: MessageResponse, sender: User
) -> Notification | None:
    connection = messages_repository.get_connection_by_id(db, message.conversation_id)
    sender_name = display_name(sender)
    body_preview = preview(message.body)

    if (
        connection is not None
        and connection.status == MessageConnectionStatus.PENDING
        and connection.requester_id == message.sender_id
    ):
        return _commit_notifications(
            db,
            [
                _queue_notification_if_enabled(
                    db,
                    user_id=message.recipient_id,
                    preference_key="connectionRequest",
                    type=NotifType.NETWORK,
                    title="New connection request",
                    body=f"{sender_name}: {body_preview}",
                    tab="inbox",
                    action_label="Open Inbox",
                )
            ],
        )

    return _commit_notifications(
        db,
        [
            _queue_notification_if_enabled(
                db,
                user_id=message.recipient_id,
                preference_key="messageReceived",
                type=NotifType.MESSAGE,
                title=f"Message from {sender_name}",
                body=body_preview,
                tab="inbox",
                action_label="Open Inbox",
            )
        ],
    )


def notify_connection_request(
    db: Session,
    *,
    requester: User,
    receiver_id: UUID,
    note: str | None,
) -> Notification | None:
    requester_name = display_name(requester)
    body = f"{requester_name} wants to connect with you."
    if note:
        body = f"{requester_name}: {preview(note)}"
    return _commit_notifications(
        db,
        [
            _queue_notification_if_enabled(
                db,
                user_id=receiver_id,
                preference_key="connectionRequest",
                type=NotifType.NETWORK,
                title="New connection request",
                body=body,
                tab="network",
                action_label="View Request",
            )
        ],
    )


def notify_connection_accepted(
    db: Session,
    *,
    requester_id: UUID,
    accepter: User,
) -> Notification | None:
    requester = users_repository.get_user_by_id(db, requester_id)
    if requester is None:
        return None

    application = _accepted_application_for_connection(
        db,
        requester=requester,
        accepter=accepter,
    )
    if application is not None:
        blueprint_name = application_blueprint_name(application)
        return _commit_notifications(
            db,
            [
                _queue_notification_if_enabled(
                    db,
                    user_id=requester_id,
                    preference_key="applicationUpdate",
                    type=NotifType.APPLICATION,
                    title="Application accepted",
                    body=(
                        f"{display_name(accepter)} accepted your application "
                        f"for {blueprint_name}."
                    ),
                    tab="applications",
                    action_label="View Applications",
                )
            ],
        )

    return _commit_notifications(
        db,
        [
            _queue_notification_if_enabled(
                db,
                user_id=requester_id,
                preference_key="connectionAccepted",
                type=NotifType.NETWORK,
                title="Connection accepted",
                body=f"{display_name(accepter)} accepted your connection request.",
                tab="network",
                action_label="View Network",
            )
        ],
    )


def notify_application_created(
    db: Session,
    *,
    application_id: UUID,
    developer: User,
) -> Notification | None:
    application = applications_repository.get_application_by_id(db, application_id)
    if application is None:
        return None

    blueprint = application.blueprint
    if blueprint is None:
        return None

    role = f" for {application.role}" if application.role else ""
    return _commit_notifications(
        db,
        [
            _queue_notification_if_enabled(
                db,
                user_id=blueprint.founder_id,
                preference_key="applicationReceived",
                type=NotifType.APPLICATION,
                title="New developer application",
                body=(
                    f"{display_name(developer)} applied{role} "
                    f"on {application_blueprint_name(application)}."
                ),
                tab="workspace",
                action_label="Review Blueprint",
            )
        ],
    )


def notify_blueprint_published(
    db: Session,
    *,
    blueprint_id: UUID,
    founder: User,
) -> list[Notification]:
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    if blueprint is None:
        return []

    blueprint_name = (
        blueprint.current_version.name if blueprint.current_version else "your blueprint"
    )
    notifications: list[Notification | None] = [
        _queue_notification_if_enabled(
            db,
            user_id=founder.id,
            preference_key="blueprintPublished",
            type=NotifType.BLUEPRINT,
            title="Blueprint published",
            body=f"{blueprint_name} is now live in Discover.",
            tab="workspace",
            action_label="View Blueprint",
        )
    ]

    developers, _ = users_repository.list_users(
        db,
        role=UserRole.DEVELOPER,
        limit=500,
        offset=0,
    )
    founder_name = display_name(founder)
    for developer in developers:
        if developer.id == founder.id:
            continue
        notifications.append(
            _queue_notification_if_enabled(
                db,
                user_id=developer.id,
                preference_key="blueprintPublished",
                type=NotifType.BLUEPRINT,
                title="New public blueprint",
                body=f"{founder_name} published {blueprint_name}.",
                tab="discover",
                action_label="View in Discover",
            )
        )

    return _commit_notifications(db, notifications, many=True)


def preference_enabled(user: User, preference_key: str) -> bool:
    preferences = normalize_preferences(user.notification_preferences)
    return preferences.get(preference_key, True)


def display_name(user: User) -> str:
    name = f"{user.first_name} {user.last_name}".strip()
    return name or user.email


def preview(value: str, max_length: int = 120) -> str:
    compact = " ".join(value.split())
    if len(compact) <= max_length:
        return compact
    return f"{compact[: max_length - 3].rstrip()}..."


def application_blueprint_name(application: Application) -> str:
    blueprint = application.blueprint
    version = blueprint.current_version if blueprint is not None else None
    return version.name if version is not None else "this blueprint"


def _accepted_application_for_connection(
    db: Session,
    *,
    requester: User,
    accepter: User,
) -> Application | None:
    if requester.role != UserRole.DEVELOPER or accepter.role != UserRole.FOUNDER:
        return None
    return applications_repository.get_latest_active_application_between_founder_and_developer(
        db,
        founder_id=accepter.id,
        developer_id=requester.id,
    )


def _queue_notification_if_enabled(
    db: Session,
    *,
    user_id: UUID,
    preference_key: str,
    type: NotifType,
    title: str,
    body: str,
    tab: str,
    action_label: str,
) -> Notification | None:
    recipient = users_repository.get_user_by_id(db, user_id)
    if recipient is None or not preference_enabled(recipient, preference_key):
        return None
    return notifications_repository.create_notification(
        db,
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        tab=tab,
        action_label=action_label,
    )


def _commit_notifications(
    db: Session,
    notifications: list[Notification | None],
    *,
    many: bool = False,
) -> Notification | list[Notification] | None:
    created = [notification for notification in notifications if notification is not None]
    if not created:
        return [] if many else None

    try:
        db.commit()
        for notification in created:
            db.refresh(notification)
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Notification delivery could not be persisted.")
        return [] if many else None

    return created if many else created[0]
