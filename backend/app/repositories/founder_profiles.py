from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import FounderProfile
from app.repositories import educations as educations_repository
from app.repositories.shared.profile_operations import apply_profile_updates, build_profile_values
from app.schemas.founder_profiles import FounderProfileCreate, FounderProfileUpdate

FOUNDER_PROFILE_FIELDS = (
    "headline",
    "bio",
    "description",
    "linkedin",
    "venture_stage",
    "primary_goal",
    "profile_complete",
)
FOUNDER_DEFAULTS = {"primary_goal": "not_selected"}
EDUCATION_EXCLUDE = {"educations"}


def get_founder_profile_by_user_id(db: Session, user_id: UUID) -> FounderProfile | None:
    return db.get(FounderProfile, user_id)


def create_founder_profile(
    db: Session, *, user_id: UUID, payload: FounderProfileCreate
) -> FounderProfile:
    profile_values = build_profile_values(
        payload,
        FOUNDER_PROFILE_FIELDS,
        defaults=FOUNDER_DEFAULTS,
        exclude=EDUCATION_EXCLUDE,
    )
    profile = FounderProfile(
        user_id=user_id,
        stripe_connected=False,
        **profile_values,
    )
    db.add(profile)
    educations_repository.replace_educations_for_user(
        db,
        user_id=user_id,
        educations=payload.educations,
    )
    return profile


def update_founder_profile(
    db: Session, *, profile: FounderProfile, payload: FounderProfileUpdate
) -> FounderProfile:
    apply_profile_updates(
        profile,
        payload,
        FOUNDER_PROFILE_FIELDS,
        defaults=FOUNDER_DEFAULTS,
        exclude=EDUCATION_EXCLUDE,
    )

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
