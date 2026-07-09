from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import FounderProfile, User, UserRole
from app.repositories import founder_profiles as founder_profiles_repository
from app.schemas.founder_profiles import (
    FounderProfileCreate,
    FounderProfileResponse,
    FounderProfileUpdate,
)
from app.services.profile_helpers import (
    commit_profile_change,
    ensure_user_role,
    get_education_responses,
)


def create_profile(
    db: Session, payload: FounderProfileCreate, current_user: User
) -> FounderProfileResponse:
    ensure_user_role(current_user, UserRole.FOUNDER, "founder")
    if founder_profiles_repository.get_founder_profile_by_user_id(db, current_user.id) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Founder profile already exists. Use PATCH to update it.",
        )

    profile = founder_profiles_repository.create_founder_profile(
        db,
        user_id=current_user.id,
        payload=payload,
    )
    commit_profile_change(db, "Founder profile could not be created.")
    db.refresh(profile)
    return build_response(db, profile)


def get_profile(db: Session, current_user: User) -> FounderProfileResponse:
    ensure_user_role(current_user, UserRole.FOUNDER, "founder")
    return build_response(db, get_profile_or_404(db, current_user.id))


def update_profile(
    db: Session, payload: FounderProfileUpdate, current_user: User
) -> FounderProfileResponse:
    ensure_user_role(current_user, UserRole.FOUNDER, "founder")
    profile = get_profile_or_404(db, current_user.id)
    founder_profiles_repository.update_founder_profile(db, profile=profile, payload=payload)
    commit_profile_change(db, "Founder profile could not be updated.")
    db.refresh(profile)
    return build_response(db, profile)


def delete_profile(db: Session, current_user: User) -> None:
    ensure_user_role(current_user, UserRole.FOUNDER, "founder")
    profile = get_profile_or_404(db, current_user.id)
    founder_profiles_repository.delete_founder_profile_for_user(db, profile=profile)
    commit_profile_change(db, "Founder profile could not be deleted.")


def get_profile_or_404(db: Session, user_id: UUID) -> FounderProfile:
    profile = founder_profiles_repository.get_founder_profile_by_user_id(db, user_id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Founder profile not found.",
        )
    return profile


def build_response(db: Session, profile: FounderProfile) -> FounderProfileResponse:
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
        educations=get_education_responses(db, profile.user_id),
    )
