from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import DeveloperProfile, FounderProfile, User, UserRole
from app.schemas.auth import DeveloperSignupDetails, FounderSignupDetails, SignupRequest


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.strip().lower()
    return db.scalar(select(User).where(func.lower(User.email) == normalized_email))


def create_user(db: Session, user_id: UUID, signup: SignupRequest, password_placeholder: str) -> User:
    user = User(
        id=user_id,
        email=str(signup.email).lower(),
        password_hash=password_placeholder,
        role=UserRole(signup.role.value),
        first_name=signup.first_name,
        last_name=signup.last_name,
        phone=signup.phone,
        country=signup.country,
        country_code=signup.country_code,
        state_province=signup.state_province,
        city=signup.city,
        dob=signup.dob,
        gender=signup.gender,
        avatar_url=str(signup.avatar_url) if signup.avatar_url else None,
        terms_accepted_at=signup.terms_accepted_at,
    )
    db.add(user)
    return user


def create_founder_profile(
    db: Session,
    user_id: UUID,
    details: FounderSignupDetails | None,
) -> FounderProfile:
    details = details or FounderSignupDetails()
    profile = FounderProfile(
        user_id=user_id,
        headline=details.headline,
        bio=details.bio,
        description=details.description,
        linkedin=details.linkedin,
        venture_stage=details.venture_stage,
        primary_goal=details.primary_goal or "not_selected",
        profile_complete=False,
        stripe_connected=False,
    )
    db.add(profile)
    return profile


def create_developer_profile(
    db: Session,
    user_id: UUID,
    details: DeveloperSignupDetails | None,
) -> DeveloperProfile:
    details = details or DeveloperSignupDetails()
    profile = DeveloperProfile(
        user_id=user_id,
        job_title=details.job_title,
        bio=details.bio,
        experience_years=details.experience_years,
        availability=details.availability,
        open_to_remote=details.open_to_remote,
        preferred_budget=details.preferred_budget,
        github=details.github,
        linkedin=details.linkedin,
        portfolio_link=details.portfolio_link,
        rating_avg=0,
        profile_complete=False,
    )
    db.add(profile)
    return profile
