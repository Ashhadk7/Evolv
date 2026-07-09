from __future__ import annotations

from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.user import Education
from app.schemas.educations import EducationCreate


def list_educations_for_user(db: Session, user_id: UUID) -> list[Education]:
    statement = select(Education).where(Education.user_id == user_id).order_by(Education.id)
    return list(db.scalars(statement).all())


def replace_educations_for_user(
    db: Session,
    *,
    user_id: UUID,
    educations: list[EducationCreate],
) -> None:
    delete_educations_for_user(db, user_id)
    db.add_all([Education(user_id=user_id, **education.model_dump()) for education in educations])


def delete_educations_for_user(db: Session, user_id: UUID) -> None:
    db.execute(delete(Education).where(Education.user_id == user_id))
