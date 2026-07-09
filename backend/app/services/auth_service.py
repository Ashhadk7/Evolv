from __future__ import annotations

import hashlib
import hmac
import logging
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.repositories import users as users_repository
from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
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
    EmailDeliveryError,
    EmailOtpError,
    InvalidCredentialsError,
    ProfilePersistenceError,
)
from app.services.supabase_auth import SupabaseAuthClient

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, auth_client: SupabaseAuthClient, email_sender: SmtpEmailSender) -> None:
        self._auth_client = auth_client
        self._email_sender = email_sender

    def start_signup(self, db: Session, signup: SignupRequest) -> SignupStartResponse:
        existing_user = users_repository.get_user_by_email(db, str(signup.email))
        if existing_user is not None and existing_user.email_verified:
            raise DuplicateEmailError("A user with this email already exists.")

        if existing_user is not None:
            self._auth_client.delete_user(existing_user.id)
            users_repository.delete_user(db, existing_user)
            db.flush()

        auth_user = self._auth_client.create_signup_user(signup)
        otp_code = self._generate_otp()
        expires_at = datetime.now(UTC) + timedelta(minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES)

        try:
            app_user = users_repository.create_user(
                db,
                auth_user.id,
                signup,
                email_otp_hash=self._hash_otp(auth_user.email, otp_code),
                email_otp_expires_at=expires_at,
            )
            db.flush()
            self._email_sender.send_signup_otp(
                email=app_user.email,
                otp_code=otp_code,
                expires_minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES,
            )
            db.commit()
            db.refresh(app_user)
        except SQLAlchemyError as exc:
            db.rollback()
            self._auth_client.delete_user(auth_user.id)
            raise ProfilePersistenceError("Signup data could not be saved.") from exc
        except EmailDeliveryError:
            db.rollback()
            self._auth_client.delete_user(auth_user.id)
            raise

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
        if app_user is None or app_user.email_verified:
            raise EmailOtpError("No email verification is in progress for this email.")

        if app_user.email_otp_expires_at is None:
            raise EmailOtpError("No email verification is in progress for this email.")

        if self._as_aware_utc(app_user.email_otp_expires_at) <= datetime.now(UTC):
            raise EmailOtpError("This signup code expired. Request a new code.")

        if not self._otp_matches(app_user.email, verification.otp, app_user.email_otp_hash):
            raise EmailOtpError("Invalid email verification code.")

        try:
            users_repository.mark_email_verified(app_user)
            db.commit()
            db.refresh(app_user)
        except SQLAlchemyError as exc:
            db.rollback()
            raise ProfilePersistenceError(
                "Email was verified, but user data could not be saved."
            ) from exc

        return self._signup_response(app_user, message="Email verified and signup completed.")

    def resend_signup_otp(
        self,
        db: Session,
        resend_request: SignupResendOtpRequest,
    ) -> SignupStartResponse:
        app_user = users_repository.get_user_by_email(db, str(resend_request.email))
        if app_user is None or app_user.email_verified:
            raise EmailOtpError("No email verification is in progress for this email.")

        otp_code = self._generate_otp()
        expires_at = datetime.now(UTC) + timedelta(minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES)

        try:
            users_repository.set_email_otp(
                app_user,
                otp_hash=self._hash_otp(app_user.email, otp_code),
                expires_at=expires_at,
            )
            db.flush()
            self._email_sender.send_signup_otp(
                email=app_user.email,
                otp_code=otp_code,
                expires_minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES,
            )
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            raise ProfilePersistenceError("Verification code could not be saved.") from exc
        except EmailDeliveryError:
            db.rollback()
            raise

        return SignupStartResponse(
            email=app_user.email,
            expires_at=expires_at,
            message="Verification code resent.",
            debug_otp=self._debug_otp(otp_code),
        )

    def signin(self, db: Session, signin: SigninRequest) -> SigninResponse:
        app_user = users_repository.get_user_by_email(db, str(signin.email))
        if app_user is None:
            raise InvalidCredentialsError("Invalid email or password.")
        if not app_user.email_verified:
            raise EmailOtpError("Email verification is required before sign in.")

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
    def forgot_password(
        self, db: Session, forgot_request: ForgotPasswordRequest
    ) -> ForgotPasswordResponse:
        app_user = users_repository.get_user_by_email(db, str(forgot_request.email))
        generic_message = "If an account exists for this email, a reset code has been sent."

        if app_user is None or not app_user.email_verified:
            return ForgotPasswordResponse(message=generic_message)

        otp_code = self._generate_otp()
        expires_at = datetime.now(UTC) + timedelta(minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES)

        try:
            users_repository.set_password_reset_otp(
                app_user,
                otp_hash=self._hash_otp(app_user.email, otp_code),
                expires_at=expires_at,
            )
            db.flush()
            self._email_sender.send_password_reset_otp(
                email=app_user.email,
                otp_code=otp_code,
                expires_minutes=settings.SIGNUP_OTP_EXPIRE_MINUTES,
            )
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            logger.exception(
                "Database error while saving password reset OTP for %s.", app_user.email
            )
            raise ProfilePersistenceError("Password reset code could not be saved.") from exc
        except EmailDeliveryError:
            db.rollback()
            logger.exception(
                "Email delivery failed while sending password reset OTP to %s.", app_user.email
            )
            raise

        return ForgotPasswordResponse(message=generic_message, debug_otp=self._debug_otp(otp_code))

    def reset_password(
        self, db: Session, reset_request: ResetPasswordRequest
    ) -> ResetPasswordResponse:
        app_user = users_repository.get_user_by_email(db, str(reset_request.email))
        if app_user is None or app_user.password_reset_otp_expires_at is None:
            raise EmailOtpError("No password reset is in progress for this email.")

        if self._as_aware_utc(app_user.password_reset_otp_expires_at) <= datetime.now(UTC):
            raise EmailOtpError("This reset code expired. Request a new code.")

        if not self._otp_matches(
            app_user.email, reset_request.otp, app_user.password_reset_otp_hash
        ):
            raise EmailOtpError("Invalid password reset code.")

        self._auth_client.update_password(
            app_user.id, reset_request.new_password.get_secret_value()
        )

        try:
            users_repository.clear_password_reset_otp(app_user)
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            logger.exception(
                "Password was reset for %s but clearing the reset code failed.", app_user.email
            )
            raise ProfilePersistenceError(
                "Password was reset, but the reset code could not be cleared."
            ) from exc

        return ResetPasswordResponse(
            message="Password has been reset. You can sign in with your new password."
        )

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
        return hmac.new(settings.SECRET_KEY.encode(), message, hashlib.sha256).hexdigest()

    def _otp_matches(self, email: str, otp_code: str, stored_hash: str | None) -> bool:
        if stored_hash is None:
            return False
        return hmac.compare_digest(self._hash_otp(email, otp_code), stored_hash)

    @staticmethod
    def _debug_otp(otp_code: str) -> str | None:
        if settings.SIGNUP_OTP_RETURN_DEBUG:
            return otp_code
        return None
