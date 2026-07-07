from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
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
    for education_data in educations:
        db.add(
            Education(
                user_id=user_id,
                level=education_data.level,
                degree=education_data.degree,
                custom_degree=education_data.custom_degree,
                school=education_data.school,
            )
        )


def delete_educations_for_user(db: Session, user_id: UUID) -> None:
    for education in list_educations_for_user(db, user_id):
        db.delete(education)
