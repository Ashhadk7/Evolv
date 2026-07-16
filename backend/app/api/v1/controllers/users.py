from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import SQLAlchemyError

from app.api.deps import CurrentUser, DbSession, get_current_user
from app.models.user import DeveloperProfile, User, UserRole
from app.repositories import developer_reviews as developer_reviews_repository
from app.repositories import users as users_repository
from app.schemas.auth import SignupRole
from app.schemas.certifications import CertificationResponse
from app.schemas.educations import EducationResponse
from app.schemas.users import (
    DeveloperReviewRequest,
    DeveloperReviewResponse,
    PublicDeveloperProfile,
    PublicFounderProfile,
    PublicUserProfile,
    UserListResponse,
    UserSummary,
)
from app.services.profile_helpers import build_review_response

router = APIRouter(dependencies=[Depends(get_current_user)])

RoleFilter = Annotated[SignupRole | None, Query()]
SearchFilter = Annotated[str | None, Query(min_length=1, max_length=100)]
LimitFilter = Annotated[int, Query(ge=1, le=100)]
OffsetFilter = Annotated[int, Query(ge=0)]


@router.get("", response_model=UserListResponse)
def list_users(
    db: DbSession,
    role: RoleFilter = None,
    search: SearchFilter = None,
    limit: LimitFilter = 50,
    offset: OffsetFilter = 0,
) -> UserListResponse:
    users, total = users_repository.list_users(
        db,
        role=UserRole(role.value) if role else None,
        search=search,
        limit=limit,
        offset=offset,
    )
    return UserListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=[UserSummary.model_validate(user) for user in users],
    )


@router.get("/{user_id}/profile", response_model=PublicUserProfile)
def get_public_profile(user_id: UUID, db: DbSession) -> PublicUserProfile:
    user = users_repository.get_user_with_public_profile_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    return build_public_profile_response(user)


@router.post(
    "/{user_id}/developer-reviews",
    response_model=DeveloperReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_developer_review(
    user_id: UUID,
    payload: DeveloperReviewRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> DeveloperReviewResponse:
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot review your own developer profile.",
        )
    ensure_user_can_review(current_user)

    developer = users_repository.get_user_with_public_profile_by_id(db, user_id)
    if (
        developer is None
        or developer.role != UserRole.DEVELOPER
        or developer.developer_profile is None
        or not developer.profile_complete
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer profile not found.",
        )

    review = developer_reviews_repository.upsert_review(
        db,
        developer_user_id=user_id,
        reviewer_user_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Review could not be saved.",
        ) from exc

    db.refresh(review)
    return build_review_response(review)


@router.get("/{user_id}", response_model=UserSummary)
def get_user(user_id: UUID, db: DbSession) -> UserSummary:
    user = users_repository.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    return UserSummary.model_validate(user)


def build_public_profile_response(user: User) -> PublicUserProfile:
    base = UserSummary.model_validate(user).model_dump()
    return PublicUserProfile(
        **base,
        founder_profile=build_founder_profile_response(user) if user.founder_profile else None,
        developer_profile=build_developer_profile_response(user) if user.developer_profile else None,
    )


def build_founder_profile_response(user: User) -> PublicFounderProfile:
    profile = user.founder_profile
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Founder profile not found.")
    return PublicFounderProfile(
        headline=profile.headline,
        bio=profile.bio,
        description=profile.description,
        linkedin=profile.linkedin,
        venture_stage=profile.venture_stage,
        primary_goal=profile.primary_goal,
        domains=profile.domains,
        profile_complete=user.profile_complete,
        educations=[EducationResponse.model_validate(education) for education in user.educations],
    )


def build_developer_profile_response(user: User) -> PublicDeveloperProfile:
    profile = user.developer_profile
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Developer profile not found.")
    assert isinstance(profile, DeveloperProfile)
    return PublicDeveloperProfile(
        job_title=profile.job_title,
        bio=profile.bio,
        experience_years=profile.experience_years,
        availability=profile.availability,
        open_to_remote=profile.open_to_remote,
        preferred_budget=profile.preferred_budget,
        github=profile.github,
        linkedin=profile.linkedin,
        portfolio_link=profile.portfolio_link,
        skills=profile.skills,
        rating_avg=float(profile.rating_avg or 0),
        profile_complete=user.profile_complete,
        educations=[EducationResponse.model_validate(education) for education in user.educations],
        certifications=[
            CertificationResponse.model_validate(certification)
            for certification in user.certifications
        ],
        reviews=[build_review_response(review) for review in profile.reviews],
    )


def ensure_user_can_review(user: User) -> None:
    if not user.phone_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify your phone number before submitting reviews.",
        )
    if not user.profile_complete:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete your profile before submitting reviews.",
        )
