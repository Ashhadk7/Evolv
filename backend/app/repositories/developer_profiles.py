from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import DeveloperProfile
from app.repositories import educations as educations_repository
from app.repositories import certifications as certifications_repository
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
    "skills",
    "profile_complete",
)
PROFILE_EXCLUDE = {"educations", "certifications"}


def get_developer_profile_by_user_id(db: Session, user_id: UUID) -> DeveloperProfile | None:
    return db.get(DeveloperProfile, user_id)


def get_existing_developer_ids(db: Session, user_ids: set[UUID]) -> set[UUID]:
    """Return the subset of user_ids that have a real developer profile."""
    if not user_ids:
        return set()
    rows = db.execute(
        select(DeveloperProfile.user_id).where(DeveloperProfile.user_id.in_(user_ids))
    ).all()
    return {row[0] for row in rows}


def create_developer_profile(
    db: Session, *, user_id: UUID, payload: DeveloperProfileCreate
) -> DeveloperProfile:
    profile_values = build_profile_values(
        payload,
        DEVELOPER_PROFILE_FIELDS,
        exclude=PROFILE_EXCLUDE,
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
    certifications_repository.replace_certifications_for_user(
        db,
        user_id=user_id,
        certifications=payload.certifications,
    )
    return profile


def update_developer_profile(
    db: Session, *, profile: DeveloperProfile, payload: DeveloperProfileUpdate
) -> DeveloperProfile:
    apply_profile_updates(profile, payload, DEVELOPER_PROFILE_FIELDS, exclude=PROFILE_EXCLUDE)

    if payload.educations is not None:
        educations_repository.replace_educations_for_user(
            db,
            user_id=profile.user_id,
            educations=payload.educations,
        )

    if payload.certifications is not None:
        certifications_repository.replace_certifications_for_user(
            db,
            user_id=profile.user_id,
            certifications=payload.certifications,
        )

    return profile


def delete_developer_profile_for_user(db: Session, *, profile: DeveloperProfile) -> None:
    educations_repository.delete_educations_for_user(db, profile.user_id)
    certifications_repository.delete_certifications_for_user(db, profile.user_id)
    db.delete(profile)
