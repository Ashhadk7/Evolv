from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import PendingSignup, UserRole
from app.schemas.auth import SignupRequest


def get_pending_signup_by_email(db: Session, email: str) -> PendingSignup | None:
    normalized_email = email.strip().lower()
    return db.scalar(select(PendingSignup).where(func.lower(PendingSignup.email) == normalized_email))


def delete_pending_signup(db: Session, pending_signup: PendingSignup) -> None:
    db.delete(pending_signup)


def create_or_update_pending_signup(
    db: Session,
    *,
    auth_user_id: UUID,
    signup: SignupRequest,
    email_otp_hash: str,
    expires_at: datetime,
) -> PendingSignup:
    pending_signup = get_pending_signup_by_email(db, str(signup.email))

    if pending_signup is None:
        pending_signup = PendingSignup(id=uuid4())
        db.add(pending_signup)

    pending_signup.auth_user_id = auth_user_id
    pending_signup.email = str(signup.email).lower()
    pending_signup.role = UserRole(signup.role.value)
    pending_signup.first_name = signup.first_name
    pending_signup.last_name = signup.last_name
    pending_signup.phone = signup.phone
    pending_signup.country = signup.country
    pending_signup.country_code = signup.country_code
    pending_signup.state_province = signup.state_province
    pending_signup.city = signup.city
    pending_signup.dob = signup.dob
    pending_signup.gender = signup.gender
    pending_signup.avatar_url = str(signup.avatar_url) if signup.avatar_url else None
    pending_signup.terms_accepted_at = signup.terms_accepted_at
    pending_signup.founder_details = (
        signup.founder_details.model_dump(mode="json") if signup.founder_details else None
    )
    pending_signup.developer_details = (
        signup.developer_details.model_dump(mode="json") if signup.developer_details else None
    )
    pending_signup.email_otp_hash = email_otp_hash
    pending_signup.expires_at = expires_at
    return pending_signup
