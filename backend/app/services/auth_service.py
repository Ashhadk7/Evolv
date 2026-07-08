from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
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
from app.services.exceptions import AppError, ErrorCode
from app.services.supabase_auth import SupabaseAuthClient


class AuthService:
    def __init__(self, auth_client: SupabaseAuthClient, email_sender: SmtpEmailSender) -> None:
        self._auth_client = auth_client
        self._email_sender = email_sender

    def start_signup(self, db: Session, signup: SignupRequest) -> SignupStartResponse:
        existing_user = users_repository.get_user_by_email(db, str(signup.email))
        if existing_user is not None:
            if existing_user.email_verified:
                raise AppError(ErrorCode.DUPLICATE_EMAIL, "A user with this email already exists.")

            auth_user_id = existing_user.id
            users_repository.delete_user(db, existing_user)
            try:
                db.commit()
            except SQLAlchemyError as exc:
                db.rollback()
                raise AppError(
                    ErrorCode.PROFILE_PERSISTENCE,
                    "Existing unverified signup could not be replaced.",
                ) from exc
            self._auth_client.delete_user(auth_user_id)

        expires_at = datetime.now(UTC) + timedelta(minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES)
        auth_user = self._auth_client.create_signup_user(signup)
        otp_code = self._generate_otp()

        try:
            app_user = users_repository.create_user(
                db=db,
                user_id=auth_user.id,
                signup=signup,
                email_otp_hash=self._hash_otp(auth_user.email, otp_code),
                email_otp_expires_at=expires_at,
            )
            self._create_role_profile(db, app_user.id, signup)
            db.commit()
            db.refresh(app_user)
        except SQLAlchemyError as exc:
            db.rollback()
            self._auth_client.delete_user(auth_user.id)
            raise AppError(
                ErrorCode.PROFILE_PERSISTENCE,
                "Signup data could not be saved.",
            ) from exc

        self._email_sender.send_signup_otp(
            email=app_user.email,
            otp_code=otp_code,
            expires_minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES,
        )

        return SignupStartResponse(
            email=app_user.email,
            expires_at=expires_at,
            message="Verification code sent. Complete signup by verifying your email.",
            debug_otp=self._debug_otp(otp_code),
        )

    def verify_signup_email(
        self,
        db: Session,
        verification: SignupVerifyEmailRequest,
    ) -> SignupResponse:
        app_user = users_repository.get_user_by_email(db, str(verification.email))
        if app_user is None:
            raise AppError(ErrorCode.SIGNUP_NOT_FOUND, "No signup exists for this email.")

        if app_user.email_verified:
            return self._signup_response(app_user, message="Email is already verified.")

        expires_at = app_user.email_otp_expires_at
        if expires_at is None:
            raise AppError(ErrorCode.SIGNUP_NOT_FOUND, "No signup verification code exists.")

        if self._as_aware_utc(expires_at) <= datetime.now(UTC):
            auth_user_id = app_user.id
            try:
                users_repository.delete_user(db, app_user)
                db.commit()
            except SQLAlchemyError as exc:
                db.rollback()
                raise AppError(
                    ErrorCode.PROFILE_PERSISTENCE,
                    "Expired signup data could not be removed.",
                ) from exc

            self._auth_client.delete_user(auth_user_id)
            raise AppError(ErrorCode.SIGNUP_EXPIRED, "This signup expired. Start signup again.")

        if not self._otp_matches(app_user.email, verification.otp, app_user.email_otp_hash):
            raise AppError(ErrorCode.INVALID_OTP, "Invalid or expired email verification code.")

        try:
            users_repository.mark_email_verified(app_user)
            db.commit()
            db.refresh(app_user)
        except SQLAlchemyError as exc:
            db.rollback()
            raise AppError(
                ErrorCode.PROFILE_PERSISTENCE,
                "Email verification could not be saved.",
            ) from exc

        return self._signup_response(app_user, message="Email verified and signup completed.")

    def resend_signup_otp(
        self,
        db: Session,
        resend_request: SignupResendOtpRequest,
    ) -> SignupStartResponse:
        app_user = users_repository.get_user_by_email(db, str(resend_request.email))
        if app_user is None or app_user.email_verified:
            raise AppError(
                ErrorCode.SIGNUP_NOT_FOUND,
                "No unverified signup exists for this email.",
            )

        expires_at = datetime.now(UTC) + timedelta(minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES)
        otp_code = self._generate_otp()

        try:
            users_repository.set_email_otp(
                app_user,
                email_otp_hash=self._hash_otp(app_user.email, otp_code),
                expires_at=expires_at,
            )
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            raise AppError(
                ErrorCode.PROFILE_PERSISTENCE,
                "Signup verification code could not be updated.",
            ) from exc

        self._email_sender.send_signup_otp(
            email=app_user.email,
            otp_code=otp_code,
            expires_minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES,
        )

        return SignupStartResponse(
            email=app_user.email,
            expires_at=expires_at,
            message="Verification code resent.",
            debug_otp=self._debug_otp(otp_code),
        )

    def signin(self, db: Session, signin: SigninRequest) -> SigninResponse:
        app_user = users_repository.get_user_by_email(db, str(signin.email))
        if app_user is None:
            raise AppError(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password.")

        auth_session = self._auth_client.sign_in(signin)
        if auth_session.user_id != app_user.id:
            raise AppError(
                ErrorCode.AUTH_USER_MISMATCH,
                "Auth user does not match application user.",
            )

        if not app_user.email_verified:
            raise AppError(ErrorCode.EMAIL_NOT_VERIFIED, "Email must be verified before signin.")

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
    def _create_role_profile(db: Session, user_id: UUID, signup: SignupRequest) -> None:
        if signup.role == SignupRole.FOUNDER:
            if signup.founder_details is None:
                raise AppError(ErrorCode.PROFILE_PERSISTENCE, "Founder details are missing.")
            users_repository.create_founder_profile(db, user_id, signup.founder_details)
            return

        if signup.developer_details is None:
            raise AppError(ErrorCode.PROFILE_PERSISTENCE, "Developer details are missing.")
        users_repository.create_developer_profile(db, user_id, signup.developer_details)

    @staticmethod
    def _signup_response(app_user: User, *, message: str) -> SignupResponse:
        return SignupResponse(
            id=app_user.id,
            email=app_user.email,
            role=SignupRole(app_user.role.value),
            first_name=app_user.first_name,
            last_name=app_user.last_name,
            email_confirmed=app_user.email_verified,
            message=message,
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
