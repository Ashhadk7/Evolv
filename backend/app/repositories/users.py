from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.user import DeveloperProfile, FounderProfile, User, UserRole
from app.schemas.auth import DeveloperSignupDetails, FounderSignupDetails, SignupRequest


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.strip().lower()
    return db.scalar(select(User).where(func.lower(User.email) == normalized_email))


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.get(User, user_id)


def list_users(
    db: Session,
    *,
    role: UserRole | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[User], int]:
    filters = []

    if role is not None:
        filters.append(User.role == role)

    if search:
        pattern = f"%{search.strip().lower()}%"
        filters.append(
            or_(
                func.lower(User.email).like(pattern),
                func.lower(User.first_name).like(pattern),
                func.lower(User.last_name).like(pattern),
            )
        )

    count_statement = select(func.count()).select_from(User)
    users_statement = select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)

    if filters:
        count_statement = count_statement.where(*filters)
        users_statement = users_statement.where(*filters)

    total = db.scalar(count_statement) or 0
    users = list(db.scalars(users_statement).all())
    return users, total


def create_user(db: Session, user_id: UUID, signup: SignupRequest) -> User:
    user = User(
        id=user_id,
        email=str(signup.email).lower(),
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
