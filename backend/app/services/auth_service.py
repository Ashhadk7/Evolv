from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import UserRole
from app.repositories import pending_signups as pending_signups_repository
from app.repositories import users as users_repository
from app.schemas.auth import (
    SigninRequest,
    SigninResponse,
    SignupRequest,
    SignupResendOtpRequest,
    SignupResponse,
    SignupRole,
    SignupStartResponse,
    SignupVerifyEmailRequest,
)
from app.services.email_sender import SmtpEmailSender
from app.services.exceptions import (
    AuthUserMismatchError,
    DuplicateEmailError,
    EmailOtpError,
    InvalidCredentialsError,
    PendingSignupExpiredError,
    PendingSignupNotFoundError,
    ProfilePersistenceError,
)
from app.services.supabase_auth import SupabaseAuthClient


class AuthService:
    def __init__(self, auth_client: SupabaseAuthClient, email_sender: SmtpEmailSender) -> None:
        self._auth_client = auth_client
        self._email_sender = email_sender

    def start_signup(self, db: Session, signup: SignupRequest) -> SignupStartResponse:
        existing_user = users_repository.get_user_by_email(db, str(signup.email))
        if existing_user is not None:
            raise DuplicateEmailError("A user with this email already exists.")

        existing_pending = pending_signups_repository.get_pending_signup_by_email(
            db,
            str(signup.email),
        )
        if existing_pending is not None:
            pending_signups_repository.delete_pending_signup(db, existing_pending)
            db.flush()
            self._auth_client.delete_user(existing_pending.auth_user_id)

        expires_at = datetime.now(UTC) + timedelta(minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES)
        auth_user = self._auth_client.start_email_otp_signup(signup)
        otp_code = self._generate_otp()

        try:
            pending_signups_repository.create_or_update_pending_signup(
                db=db,
                auth_user_id=auth_user.id,
                signup=signup,
                email_otp_hash=self._hash_otp(auth_user.email, otp_code),
                expires_at=expires_at,
            )
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            self._auth_client.delete_user(auth_user.id)
            raise ProfilePersistenceError("Pending signup data could not be saved.") from exc

        self._email_sender.send_signup_otp(
            email=auth_user.email,
            otp_code=otp_code,
            expires_minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES,
        )

        return SignupStartResponse(
            email=auth_user.email,
            expires_at=expires_at,
            message="Verification code sent. Complete signup by verifying your email.",
            debug_otp=self._debug_otp(otp_code),
        )

    def verify_signup_email(
        self,
        db: Session,
        verification: SignupVerifyEmailRequest,
    ) -> SignupResponse:
        pending_signup = pending_signups_repository.get_pending_signup_by_email(
            db,
            str(verification.email),
        )
        if pending_signup is None:
            raise PendingSignupNotFoundError("No pending signup exists for this email.")

        if self._as_aware_utc(pending_signup.expires_at) <= datetime.now(UTC):
            auth_user_id = pending_signup.auth_user_id
            pending_signups_repository.delete_pending_signup(db, pending_signup)
            db.commit()
            self._auth_client.delete_user(auth_user_id)
            raise PendingSignupExpiredError("This signup expired. Start signup again.")

        if not self._otp_matches(
            pending_signup.email,
            verification.otp,
            pending_signup.email_otp_hash,
        ):
            raise EmailOtpError("Invalid or expired email verification code.")

        auth_user = self._auth_client.confirm_email(pending_signup.auth_user_id)
        if auth_user.id != pending_signup.auth_user_id:
            raise EmailOtpError("Verified auth user does not match pending signup.")

        existing_user = users_repository.get_user_by_email(db, pending_signup.email)
        if existing_user is not None:
            raise DuplicateEmailError("A user with this email already exists.")

        try:
            app_user = users_repository.create_user_from_pending_signup(
                db,
                user_id=auth_user.id,
                pending_signup=pending_signup,
            )

            if pending_signup.role.value == UserRole.FOUNDER.value:
                users_repository.create_founder_profile_from_details(
                    db,
                    auth_user.id,
                    pending_signup.founder_details or {},
                )
            else:
                users_repository.create_developer_profile_from_details(
                    db,
                    auth_user.id,
                    pending_signup.developer_details or {},
                )

            pending_signups_repository.delete_pending_signup(db, pending_signup)
            db.commit()
            db.refresh(app_user)
        except SQLAlchemyError as exc:
            db.rollback()
            self._auth_client.delete_user(auth_user.id)
            raise ProfilePersistenceError("Application profile data could not be saved.") from exc

        return SignupResponse(
            id=app_user.id,
            email=app_user.email,
            role=SignupRole(app_user.role.value),
            first_name=app_user.first_name,
            last_name=app_user.last_name,
            email_confirmed=True,
            message="Email verified and signup completed.",
        )

    def resend_signup_otp(
        self,
        db: Session,
        resend_request: SignupResendOtpRequest,
    ) -> SignupStartResponse:
        pending_signup = pending_signups_repository.get_pending_signup_by_email(
            db,
            str(resend_request.email),
        )
        if pending_signup is None:
            raise PendingSignupNotFoundError("No pending signup exists for this email.")

        expires_at = datetime.now(UTC) + timedelta(minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES)
        otp_code = self._generate_otp()

        try:
            pending_signup.email_otp_hash = self._hash_otp(pending_signup.email, otp_code)
            pending_signup.expires_at = expires_at
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            raise ProfilePersistenceError("Pending signup data could not be updated.") from exc

        self._email_sender.send_signup_otp(
            email=pending_signup.email,
            otp_code=otp_code,
            expires_minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES,
        )

        return SignupStartResponse(
            email=pending_signup.email,
            expires_at=expires_at,
            message="Verification code resent.",
            debug_otp=self._debug_otp(otp_code),
        )

    def signin(self, db: Session, signin: SigninRequest) -> SigninResponse:
        app_user = users_repository.get_user_by_email(db, str(signin.email))
        if app_user is None:
            raise InvalidCredentialsError("Invalid email or password.")

        auth_session = self._auth_client.sign_in(signin)
        if auth_session.user_id != app_user.id:
            raise AuthUserMismatchError("Auth user does not match application user.")

        return SigninResponse(
            id=app_user.id,
            email=app_user.email,
            role=SignupRole(app_user.role.value),
            first_name=app_user.first_name,
            last_name=app_user.last_name,
            access_token=auth_session.access_token,
            refresh_token=auth_session.refresh_token,
            token_type=auth_session.token_type,
            expires_in=auth_session.expires_in,
            expires_at=auth_session.expires_at,
        )

    @staticmethod
    def _as_aware_utc(value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value

    @staticmethod
    def _generate_otp() -> str:
        return f"{secrets.randbelow(1_000_000):06d}"

    @staticmethod
    def _hash_otp(email: str, otp_code: str) -> str:
        message = f"{email.strip().lower()}:{otp_code}".encode()
        secret = settings.SECRET_KEY.encode("utf-8")
        return hmac.new(secret, message, hashlib.sha256).hexdigest()

    def _otp_matches(self, email: str, otp_code: str, stored_hash: str | None) -> bool:
        if stored_hash is None:
            return False
        return hmac.compare_digest(self._hash_otp(email, otp_code), stored_hash)

    @staticmethod
    def _debug_otp(otp_code: str) -> str | None:
        if settings.SIGNUP_OTP_RETURN_DEBUG:
            return otp_code
        return None
