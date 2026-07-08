from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import DeveloperProfile
from app.repositories import educations as educations_repository
from app.repositories.shared.profile_operations import apply_profile_updates, build_profile_values
from app.schemas.developer_profiles import DeveloperProfileCreate, DeveloperProfileUpdate

DEVELOPER_PROFILE_FIELDS = (
    "job_title",
    "bio",
    "experience_years",
    "availability",
    "open_to_remote",
    "preferred_budget",
    "github",
    "linkedin",
    "portfolio_link",
    "profile_complete",
)
EDUCATION_EXCLUDE = {"educations"}


def get_developer_profile_by_user_id(db: Session, user_id: UUID) -> DeveloperProfile | None:
    return db.get(DeveloperProfile, user_id)


def create_developer_profile(
    db: Session, *, user_id: UUID, payload: DeveloperProfileCreate
) -> DeveloperProfile:
    profile_values = build_profile_values(
        payload,
        DEVELOPER_PROFILE_FIELDS,
        exclude=EDUCATION_EXCLUDE,
    )
    profile = DeveloperProfile(
        user_id=user_id,
        rating_avg=0,
        **profile_values,
    )
    db.add(profile)
    educations_repository.replace_educations_for_user(
        db,
        user_id=user_id,
        educations=payload.educations,
    )
    return profile


def update_developer_profile(
    db: Session, *, profile: DeveloperProfile, payload: DeveloperProfileUpdate
) -> DeveloperProfile:
    apply_profile_updates(profile, payload, DEVELOPER_PROFILE_FIELDS, exclude=EDUCATION_EXCLUDE)

    if payload.educations is not None:
        educations_repository.replace_educations_for_user(
            db,
            user_id=profile.user_id,
            educations=payload.educations,
        )

    return profile


def delete_developer_profile_for_user(db: Session, *, profile: DeveloperProfile) -> None:
    educations_repository.delete_educations_for_user(db, profile.user_id)
    db.delete(profile)
