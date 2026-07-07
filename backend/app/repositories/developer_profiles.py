from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import DeveloperProfile
from app.repositories import educations as educations_repository
from app.schemas.developer_profiles import DeveloperProfileCreate, DeveloperProfileUpdate


def get_developer_profile_by_user_id(db: Session, user_id: UUID) -> DeveloperProfile | None:
    return db.get(DeveloperProfile, user_id)


def create_developer_profile(
    db: Session,
    *,
    user_id: UUID,
    payload: DeveloperProfileCreate,
) -> DeveloperProfile:
    profile = DeveloperProfile(
        user_id=user_id,
        job_title=payload.job_title,
        bio=payload.bio,
        experience_years=payload.experience_years,
        availability=payload.availability,
        open_to_remote=payload.open_to_remote,
        preferred_budget=payload.preferred_budget,
        github=payload.github,
        linkedin=payload.linkedin,
        portfolio_link=payload.portfolio_link,
        rating_avg=0,
        profile_complete=payload.profile_complete,
    )
    db.add(profile)
    educations_repository.replace_educations_for_user(
        db,
        user_id=user_id,
        educations=payload.educations,
    )
    return profile


def update_developer_profile(
    db: Session,
    *,
    profile: DeveloperProfile,
    payload: DeveloperProfileUpdate,
) -> DeveloperProfile:
    updates = payload.model_dump(exclude_unset=True, exclude={"educations"})
    for field, value in updates.items():
        setattr(profile, field, value)

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
