from uuid import UUID

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy.exc import SQLAlchemyError

from app.api.deps import CurrentUser, DbSession
from app.models.user import DeveloperProfile, User, UserRole
from app.repositories import developer_profiles as developer_profiles_repository
from app.repositories import educations as educations_repository
from app.schemas.developer_profiles import (
    DeveloperProfileCreate,
    DeveloperProfileResponse,
    DeveloperProfileUpdate,
)
from app.schemas.educations import EducationResponse

router = APIRouter()


@router.post("", response_model=DeveloperProfileResponse, status_code=status.HTTP_201_CREATED)
def create_developer_profile(
    payload: DeveloperProfileCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> DeveloperProfileResponse:
    _ensure_developer(current_user)
    existing_profile = developer_profiles_repository.get_developer_profile_by_user_id(
        db,
        current_user.id,
    )
    if existing_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Developer profile already exists. Use PATCH to update it.",
        )

    try:
        profile = developer_profiles_repository.create_developer_profile(
            db,
            user_id=current_user.id,
            payload=payload,
        )
        db.commit()
        db.refresh(profile)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Developer profile could not be created.",
        ) from exc

    return _developer_profile_response(db, profile)


@router.get("", response_model=DeveloperProfileResponse)
def get_my_developer_profile(
    db: DbSession,
    current_user: CurrentUser,
) -> DeveloperProfileResponse:
    _ensure_developer(current_user)
    profile = _get_current_developer_profile_or_404(db, current_user.id)
    return _developer_profile_response(db, profile)


@router.patch("", response_model=DeveloperProfileResponse)
def update_developer_profile(
    payload: DeveloperProfileUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> DeveloperProfileResponse:
    _ensure_developer(current_user)
    profile = _get_current_developer_profile_or_404(db, current_user.id)

    try:
        developer_profiles_repository.update_developer_profile(
            db,
            profile=profile,
            payload=payload,
        )
        db.commit()
        db.refresh(profile)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Developer profile could not be updated.",
        ) from exc

    return _developer_profile_response(db, profile)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_developer_profile(
    db: DbSession,
    current_user: CurrentUser,
) -> Response:
    _ensure_developer(current_user)
    profile = _get_current_developer_profile_or_404(db, current_user.id)

    try:
        developer_profiles_repository.delete_developer_profile_for_user(db, profile=profile)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Developer profile could not be deleted.",
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _ensure_developer(user: User) -> None:
    if user.role != UserRole.DEVELOPER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only developer users can access developer profile routes.",
        )


def _get_current_developer_profile_or_404(db: DbSession, user_id: UUID) -> DeveloperProfile:
    profile = developer_profiles_repository.get_developer_profile_by_user_id(db, user_id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer profile not found.",
        )
    return profile


def _developer_profile_response(
    db: DbSession,
    profile: DeveloperProfile,
) -> DeveloperProfileResponse:
    educations = educations_repository.list_educations_for_user(db, profile.user_id)
    return DeveloperProfileResponse(
        user_id=profile.user_id,
        job_title=profile.job_title,
        bio=profile.bio,
        experience_years=profile.experience_years,
        availability=profile.availability,
        open_to_remote=profile.open_to_remote,
        preferred_budget=profile.preferred_budget,
        github=profile.github,
        linkedin=profile.linkedin,
        portfolio_link=profile.portfolio_link,
        rating_avg=float(profile.rating_avg or 0),
        profile_complete=profile.profile_complete,
        educations=[EducationResponse.model_validate(education) for education in educations],
    )
