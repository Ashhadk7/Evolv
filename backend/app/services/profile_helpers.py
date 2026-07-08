from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from pydantic import TypeAdapter
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.repositories import educations as educations_repository
from app.schemas.educations import EducationResponse

EDUCATION_RESPONSES = TypeAdapter(list[EducationResponse])


def ensure_user_role(user: User, expected_role: UserRole, profile_name: str) -> None:
    if user.role != expected_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only {profile_name} users can access {profile_name} profile routes.",
        )


def commit_profile_change(db: Session, failure_detail: str) -> None:
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=failure_detail,
        ) from exc


def get_education_responses(db: Session, user_id: UUID) -> list[EducationResponse]:
    educations = educations_repository.list_educations_for_user(db, user_id)
    return EDUCATION_RESPONSES.validate_python(educations)
