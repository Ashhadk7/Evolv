from datetime import datetime
from uuid import UUID

from sqlalchemy import func, or_, select, update
from sqlalchemy.orm import Session, selectinload

from app.models.developer_review import DeveloperReview
from app.models.user import DeveloperProfile, FounderProfile, User, UserRole
from app.schemas.auth import SignupRequest


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.strip().lower()
    return db.scalar(select(User).where(func.lower(User.email) == normalized_email))


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.get(User, user_id)


def get_user_with_public_profile_by_id(db: Session, user_id: UUID) -> User | None:
    statement = (
        select(User)
        .options(
            selectinload(User.founder_profile),
            selectinload(User.developer_profile)
            .selectinload(DeveloperProfile.reviews)
            .selectinload(DeveloperReview.reviewer),
            selectinload(User.educations),
            selectinload(User.certifications),
        )
        .where(User.id == user_id)
    )
    return db.scalar(statement)


def create_user(
    db: Session,
    user_id: UUID,
    signup: SignupRequest,
    *,
    email_otp_hash: str,
    email_otp_expires_at: datetime,
) -> User:
    user = User(
        id=user_id,
        email=str(signup.email).lower(),
        role=UserRole(signup.role.value),
        first_name=signup.first_name,
        last_name=signup.last_name,
        email_verified=False,
        email_otp_hash=email_otp_hash,
        email_otp_expires_at=email_otp_expires_at,
        phone=signup.phone,
        phone_verified=False,
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


def delete_user(db: Session, user: User) -> None:
    db.delete(user)


def set_email_otp(user: User, *, otp_hash: str, expires_at: datetime) -> User:
    user.email_otp_hash = otp_hash
    user.email_otp_expires_at = expires_at
    return user


def mark_email_verified(user: User) -> User:
    user.email_verified = True
    user.email_otp_hash = None
    user.email_otp_expires_at = None
    return user

def set_password_reset_otp(user: User, *, otp_hash: str, expires_at: datetime) -> User:
    user.password_reset_otp_hash = otp_hash
    user.password_reset_otp_expires_at = expires_at
    return user


def clear_password_reset_otp(user: User) -> User:
    user.password_reset_otp_hash = None
    user.password_reset_otp_expires_at = None
    return user


def set_verified_phone(db: Session, user_id: UUID, phone: str) -> None:
    db.execute(
        update(User)
        .where(User.id == user_id)
        .values(
            phone=phone,
            phone_verified=True,
        )
    )


def list_users(
    db: Session,
    *,
    role: UserRole | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[User], int]:
    filters = [
        User.email_verified.is_(True),
        # Only users who have completed their profile are discoverable to others.
        # profile_complete is a computed property on User, so filter the underlying
        # founder/developer columns directly.
        or_(
            FounderProfile.profile_complete.is_(True),
            DeveloperProfile.profile_complete.is_(True),
        ),
    ]

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

    def with_profile_joins(statement):
        return (
            statement.outerjoin(FounderProfile, FounderProfile.user_id == User.id)
            .outerjoin(DeveloperProfile, DeveloperProfile.user_id == User.id)
        )

    count_statement = with_profile_joins(select(func.count()).select_from(User)).where(*filters)
    users_statement = (
        with_profile_joins(
            select(User).options(
                selectinload(User.founder_profile), selectinload(User.developer_profile)
            )
        )
        .where(*filters)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    total = db.scalar(count_statement) or 0
    users = list(db.scalars(users_statement).all())
    return users, total
