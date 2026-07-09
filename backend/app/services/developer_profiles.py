from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import DeveloperProfile, User, UserRole
from app.repositories import developer_profiles as developer_profiles_repository
from app.schemas.developer_profiles import (
    DeveloperProfileCreate,
    DeveloperProfileResponse,
    DeveloperProfileUpdate,
)
from app.services.profile_helpers import (
    commit_profile_change,
    ensure_user_role,
    get_education_responses,
)


def create_profile(
    db: Session, payload: DeveloperProfileCreate, current_user: User
) -> DeveloperProfileResponse:
    ensure_user_role(current_user, UserRole.DEVELOPER, "developer")
    existing_profile = developer_profiles_repository.get_developer_profile_by_user_id(
        db,
        current_user.id,
    )
    if existing_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Developer profile already exists. Use PATCH to update it.",
        )

    profile = developer_profiles_repository.create_developer_profile(
        db,
        user_id=current_user.id,
        payload=payload,
    )
    commit_profile_change(db, "Developer profile could not be created.")
    db.refresh(profile)
    return build_response(db, profile)


def get_profile(db: Session, current_user: User) -> DeveloperProfileResponse:
    ensure_user_role(current_user, UserRole.DEVELOPER, "developer")
    return build_response(db, get_profile_or_404(db, current_user.id))


def update_profile(
    db: Session, payload: DeveloperProfileUpdate, current_user: User
) -> DeveloperProfileResponse:
    ensure_user_role(current_user, UserRole.DEVELOPER, "developer")
    profile = get_profile_or_404(db, current_user.id)
    developer_profiles_repository.update_developer_profile(db, profile=profile, payload=payload)
    commit_profile_change(db, "Developer profile could not be updated.")
    db.refresh(profile)
    return build_response(db, profile)


def delete_profile(db: Session, current_user: User) -> None:
    ensure_user_role(current_user, UserRole.DEVELOPER, "developer")
    profile = get_profile_or_404(db, current_user.id)
    developer_profiles_repository.delete_developer_profile_for_user(db, profile=profile)
    commit_profile_change(db, "Developer profile could not be deleted.")


def get_profile_or_404(db: Session, user_id: UUID) -> DeveloperProfile:
    profile = developer_profiles_repository.get_developer_profile_by_user_id(db, user_id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer profile not found.",
        )
    return profile


def build_response(db: Session, profile: DeveloperProfile) -> DeveloperProfileResponse:
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
        educations=get_education_responses(db, profile.user_id),
    )
