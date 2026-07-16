from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.user import DeveloperProfile, User, UserRole


def list_available_developers(db: Session) -> list[User]:
    statement = (
        select(User)
        .join(DeveloperProfile, DeveloperProfile.user_id == User.id)
        .options(selectinload(User.developer_profile))
        .where(
            User.role == UserRole.DEVELOPER,
            User.email_verified.is_(True),
        )
    )
    return list(db.scalars(statement).all())


def get_developers_by_ids(db: Session, developer_ids: list[str]) -> list[User]:
    valid_ids: list[UUID] = []
    for developer_id in developer_ids:
        try:
            valid_ids.append(UUID(developer_id))
        except ValueError:
            continue
    if not valid_ids:
        return []

    statement = (
        select(User)
        .join(DeveloperProfile, DeveloperProfile.user_id == User.id)
        .options(selectinload(User.developer_profile))
        .where(
            User.id.in_(valid_ids),
            User.role == UserRole.DEVELOPER,
            User.email_verified.is_(True),
        )
    )
    return list(db.scalars(statement).all())
