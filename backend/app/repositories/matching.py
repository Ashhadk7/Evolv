from __future__ import annotations

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
