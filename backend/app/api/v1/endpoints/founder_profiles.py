from uuid import UUID

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy.exc import SQLAlchemyError

from app.api.deps import CurrentUser, DbSession
from app.models.user import FounderProfile, User, UserRole
from app.repositories import educations as educations_repository
from app.repositories import founder_profiles as founder_profiles_repository
from app.schemas.founder_profiles import (
    EducationResponse,
    FounderProfileCreate,
    FounderProfileResponse,
    FounderProfileUpdate,
)

router = APIRouter()


@router.post("", response_model=FounderProfileResponse, status_code=status.HTTP_201_CREATED)
def create_founder_profile(
    payload: FounderProfileCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> FounderProfileResponse:
    _ensure_founder(current_user)
    existing_profile = founder_profiles_repository.get_founder_profile_by_user_id(
        db,
        current_user.id,
    )
    if existing_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Founder profile already exists. Use PATCH to update it.",
        )

    try:
        profile = founder_profiles_repository.create_founder_profile(
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
            detail="Founder profile could not be created.",
        ) from exc

    return _founder_profile_response(db, profile)


@router.get("", response_model=FounderProfileResponse)
def get_my_founder_profile(
    db: DbSession,
    current_user: CurrentUser,
) -> FounderProfileResponse:
    _ensure_founder(current_user)
    profile = _get_current_founder_profile_or_404(db, current_user.id)
    return _founder_profile_response(db, profile)


@router.patch("", response_model=FounderProfileResponse)
def update_founder_profile(
    payload: FounderProfileUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> FounderProfileResponse:
    _ensure_founder(current_user)
    profile = _get_current_founder_profile_or_404(db, current_user.id)

    try:
        founder_profiles_repository.update_founder_profile(
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
            detail="Founder profile could not be updated.",
        ) from exc

    return _founder_profile_response(db, profile)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_founder_profile(
    db: DbSession,
    current_user: CurrentUser,
) -> Response:
    _ensure_founder(current_user)
    profile = _get_current_founder_profile_or_404(db, current_user.id)

    try:
        founder_profiles_repository.delete_founder_profile_for_user(db, profile=profile)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Founder profile could not be deleted.",
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _ensure_founder(user: User) -> None:
    if user.role != UserRole.FOUNDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founder users can access founder profile routes.",
        )


def _get_current_founder_profile_or_404(db: DbSession, user_id: UUID) -> FounderProfile:
    profile = founder_profiles_repository.get_founder_profile_by_user_id(db, user_id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Founder profile not found.",
        )
    return profile


def _founder_profile_response(db: DbSession, profile: FounderProfile) -> FounderProfileResponse:
    educations = educations_repository.list_educations_for_user(db, profile.user_id)
    return FounderProfileResponse(
        user_id=profile.user_id,
        headline=profile.headline,
        bio=profile.bio,
        description=profile.description,
        linkedin=profile.linkedin,
        venture_stage=profile.venture_stage,
        primary_goal=profile.primary_goal,
        profile_complete=profile.profile_complete,
        stripe_connected=profile.stripe_connected,
        educations=[EducationResponse.model_validate(education) for education in educations],
    )
