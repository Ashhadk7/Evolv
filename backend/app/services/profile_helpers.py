from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from pydantic import TypeAdapter
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.developer_review import DeveloperReview
from app.repositories import certifications as certifications_repository
from app.repositories import developer_reviews as developer_reviews_repository
from app.repositories import educations as educations_repository
from app.schemas.certifications import CertificationResponse
from app.schemas.developer_reviews import DeveloperReviewResponse
from app.schemas.educations import EducationResponse

EDUCATION_RESPONSES = TypeAdapter(list[EducationResponse])
CERTIFICATION_RESPONSES = TypeAdapter(list[CertificationResponse])


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


def get_certification_responses(db: Session, user_id: UUID) -> list[CertificationResponse]:
    certifications = certifications_repository.list_certifications_for_user(db, user_id)
    return CERTIFICATION_RESPONSES.validate_python(certifications)


def build_review_response(review: DeveloperReview) -> DeveloperReviewResponse:
    reviewer_name = "Evolv member"
    if review.reviewer is not None:
        reviewer_name = f"{review.reviewer.first_name} {review.reviewer.last_name}".strip()
        if not reviewer_name:
            reviewer_name = review.reviewer.email

    return DeveloperReviewResponse(
        id=review.id,
        developer_user_id=review.developer_user_id,
        reviewer_user_id=review.reviewer_user_id,
        reviewer_name=reviewer_name,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )


def get_developer_review_responses(db: Session, developer_user_id: UUID) -> list[DeveloperReviewResponse]:
    reviews = developer_reviews_repository.list_reviews_for_developer(db, developer_user_id)
    return [build_review_response(review) for review in reviews]
