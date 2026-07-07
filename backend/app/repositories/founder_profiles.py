from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import FounderProfile
from app.repositories import educations as educations_repository
from app.schemas.founder_profiles import FounderProfileCreate, FounderProfileUpdate


def get_founder_profile_by_user_id(db: Session, user_id: UUID) -> FounderProfile | None:
    return db.get(FounderProfile, user_id)


def create_founder_profile(
    db: Session,
    *,
    user_id: UUID,
    payload: FounderProfileCreate,
) -> FounderProfile:
    profile = FounderProfile(
        user_id=user_id,
        headline=payload.headline,
        bio=payload.bio,
        description=payload.description,
        linkedin=payload.linkedin,
        venture_stage=payload.venture_stage,
        primary_goal=payload.primary_goal or "not_selected",
        profile_complete=payload.profile_complete,
        stripe_connected=False,
    )
    db.add(profile)
    educations_repository.replace_educations_for_user(
        db,
        user_id=user_id,
        educations=payload.educations,
    )
    return profile


def update_founder_profile(
    db: Session,
    *,
    profile: FounderProfile,
    payload: FounderProfileUpdate,
) -> FounderProfile:
    updates = payload.model_dump(exclude_unset=True, exclude={"educations"})
    for field, value in updates.items():
        if field == "primary_goal":
            value = value or "not_selected"
        setattr(profile, field, value)

    if payload.educations is not None:
        educations_repository.replace_educations_for_user(
            db,
            user_id=profile.user_id,
            educations=payload.educations,
        )

    return profile


def delete_founder_profile_for_user(db: Session, *, profile: FounderProfile) -> None:
    educations_repository.delete_educations_for_user(db, profile.user_id)
    db.delete(profile)
