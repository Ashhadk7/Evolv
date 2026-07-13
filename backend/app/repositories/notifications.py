from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotifType


def list_notifications_for_user(
    db: Session,
    user_id: UUID,
    *,
    limit: int,
    offset: int,
) -> tuple[list[Notification], int]:
    total: int = db.scalar(
        select(func.count()).select_from(Notification).where(Notification.user_id == user_id)
    ) or 0
    items = list(
        db.scalars(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .offset(offset)
        ).all()
    )
    return items, total


def get_notification_by_id(db: Session, notification_id: UUID) -> Notification | None:
    return db.get(Notification, notification_id)


def mark_notification_read(db: Session, notification: Notification) -> Notification:
    if notification.read_at is None:
        notification.read_at = datetime.now(timezone.utc)
    return notification


def mark_all_read_for_user(db: Session, user_id: UUID) -> None:
    db.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.read_at.is_(None))
        .values(read_at=datetime.now(timezone.utc))
    )


def create_notification(
    db: Session,
    *,
    user_id: UUID,
    type: NotifType,
    title: str,
    body: str,
    tab: str,
    action_label: str,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        tab=tab,
        action_label=action_label,
    )
    db.add(notification)
    return notification
