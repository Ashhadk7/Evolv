from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User
from app.repositories import notifications as notifications_repository
from app.services.exceptions import (
    NotificationAccessDeniedError,
    NotificationNotFoundError,
    NotificationPersistenceError,
)


def list_notifications(
    db: Session, current_user: User, *, limit: int, offset: int
) -> tuple[list[Notification], int]:
    return notifications_repository.list_notifications_for_user(
        db, current_user.id, limit=limit, offset=offset
    )


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