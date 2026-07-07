from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from supabase import Client, create_client

from app.core.config import settings
from app.schemas.auth import SigninRequest, SignupRequest
from app.services.exceptions import (
    AuthProviderConfigurationError,
    AuthProviderError,
    EmailOtpError,
    InvalidCredentialsError,
    InvalidTokenError,
)


@dataclass(frozen=True)
class CreatedAuthUser:
    id: UUID
    email: str
    email_confirmed: bool


@dataclass(frozen=True)
class SupabaseAuthSession:
    user_id: UUID
    email: str
    access_token: str
    refresh_token: str | None
    token_type: str
    expires_in: int | None
    expires_at: int | None


@dataclass(frozen=True)
class SupabaseAuthenticatedUser:
    id: UUID
    email: str


class SupabaseAuthClient:
    def __init__(self) -> None:
        service_role_key = (
            settings.SUPABASE_SERVICE_ROLE_KEY.get_secret_value()
            if settings.SUPABASE_SERVICE_ROLE_KEY
            else ""
        )
        anon_key = (
            settings.SUPABASE_ANON_KEY.get_secret_value() if settings.SUPABASE_ANON_KEY else ""
        )
        if not settings.SUPABASE_URL or not service_role_key.strip():
            raise AuthProviderConfigurationError(
                "Supabase URL and service role key must be configured before auth operations."
            )

        self._supabase_url = settings.SUPABASE_URL.rstrip("/")
        self._service_role_key = service_role_key.strip()
        self._admin_client: Client = create_client(
            self._supabase_url,
            self._service_role_key,
        )
        self._auth_client: Client = create_client(
            self._supabase_url,
            anon_key.strip() or service_role_key,
        )

    def start_email_otp_signup(self, signup: SignupRequest) -> CreatedAuthUser:
        try:
            response = self._admin_client.auth.admin.create_user(
                {
                    "email": str(signup.email).lower(),
                    "password": signup.password.get_secret_value(),
                    "email_confirm": False,
                    "user_metadata": {
                        "role": signup.role.value,
                        "first_name": signup.first_name,
                        "last_name": signup.last_name,
                    },
                }
            )
        except Exception as exc:
            raise AuthProviderError(
                "Supabase Auth could not create this user. If this email already exists in "
                "Supabase Auth, delete it from Authentication > Users or test with a new email."
            ) from exc

        return self._created_user_from_response(response, email_confirmed=False)

    def confirm_email(self, user_id: UUID) -> CreatedAuthUser:
        try:
            response = self._admin_client.auth.admin.update_user_by_id(
                str(user_id),
                {
                    "email_confirm": True,
                },
            )
        except Exception as exc:
            raise EmailOtpError("Supabase Auth could not confirm this email.") from exc

        try:
            return self._created_user_from_response(response, email_confirmed=True)
        except AuthProviderError as exc:
            raise EmailOtpError("Supabase Auth returned an incomplete user response.") from exc

    def verify_signup_otp(self, email: str, otp: str) -> CreatedAuthUser:
        try:
            response = self._auth_client.auth.verify_otp(
                {
                    "email": email.lower(),
                    "token": otp,
                    "type": "email",
                }
            )
        except Exception as exc:
            raise EmailOtpError("Invalid or expired email verification code.") from exc

        return self._created_user_from_response(response, email_confirmed=True)

    def _created_user_from_response(
        self,
        response: Any,
        *,
        email_confirmed: bool,
    ) -> CreatedAuthUser:
        user = self._read_user(response)
        user_id = self._read_value(user, "id")
        email = self._read_value(user, "email")

        if user_id is None or email is None:
            raise AuthProviderError("Supabase Auth returned an incomplete user response.")

        return CreatedAuthUser(
            id=UUID(str(user_id)),
            email=str(email).lower(),
            email_confirmed=email_confirmed,
        )

    def resend_signup_otp(self, email: str) -> None:
        try:
            self._auth_client.auth.resend(
                {
                    "type": "signup",
                    "email": email.lower(),
                }
            )
        except Exception as exc:
            raise EmailOtpError("Email verification code could not be resent.") from exc

    def sign_in(self, signin: SigninRequest) -> SupabaseAuthSession:
        try:
            response = self._auth_client.auth.sign_in_with_password(
                {
                    "email": str(signin.email).lower(),
                    "password": signin.password.get_secret_value(),
                }
            )
        except Exception as exc:
            raise InvalidCredentialsError("Invalid email or password.") from exc

        user = self._read_user(response)
        session = self._read_session(response)

        user_id = self._read_value(user, "id")
        email = self._read_value(user, "email")
        access_token = self._read_value(session, "access_token")

        if user_id is None or email is None or access_token is None:
            raise AuthProviderError("Supabase Auth returned an incomplete signin response.")

        return SupabaseAuthSession(
            user_id=UUID(str(user_id)),
            email=str(email).lower(),
            access_token=str(access_token),
            refresh_token=self._optional_str(self._read_value(session, "refresh_token")),
            token_type=self._optional_str(self._read_value(session, "token_type")) or "bearer",
            expires_in=self._optional_int(self._read_value(session, "expires_in")),
            expires_at=self._optional_int(self._read_value(session, "expires_at")),
        )

    def get_user(self, access_token: str) -> SupabaseAuthenticatedUser:
        try:
            response = self._auth_client.auth.get_user(access_token)
        except Exception as exc:
            raise InvalidTokenError("Invalid or expired access token.") from exc

        user = self._read_user(response)
        user_id = self._read_value(user, "id")
        email = self._read_value(user, "email")

        if user_id is None or email is None:
            raise InvalidTokenError("Invalid or expired access token.")

        return SupabaseAuthenticatedUser(id=UUID(str(user_id)), email=str(email).lower())

    def delete_user(self, user_id: UUID) -> None:
        try:
            self._admin_client.auth.admin.delete_user(str(user_id))
        except Exception:
            return

    @staticmethod
    def _read_user(response: Any) -> Any:
        user = SupabaseAuthClient._read_value(response, "user")
        if user is not None:
            return user

        data = SupabaseAuthClient._read_value(response, "data")
        if data is not None:
            user = SupabaseAuthClient._read_value(data, "user")
            if user is not None:
                return user

        return response

    @staticmethod
    def _read_session(response: Any) -> Any:
        session = SupabaseAuthClient._read_value(response, "session")
        if session is not None:
            return session

        data = SupabaseAuthClient._read_value(response, "data")
        if data is not None:
            session = SupabaseAuthClient._read_value(data, "session")
            if session is not None:
                return session

        return response

    @staticmethod
    def _read_value(source: Any, key: str) -> Any:
        if isinstance(source, dict):
            return source.get(key)
        return getattr(source, key, None)

    @staticmethod
    def _optional_str(value: Any) -> str | None:
        if value is None:
            return None
        return str(value)

    @staticmethod
    def _optional_int(value: Any) -> int | None:
        if value is None:
            return None
        return int(value)
