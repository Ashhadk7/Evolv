from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from httpx import HTTPError
from supabase import Client, create_client

try:
    from gotrue.errors import AuthApiError as GoTrueAuthApiError
except ModuleNotFoundError:
    GoTrueAuthApiError = None

try:
    from supabase_auth.errors import AuthApiError as SupabaseAuthApiError
except ModuleNotFoundError:
    SupabaseAuthApiError = None

from app.core.config import settings
from app.schemas.auth import SigninRequest, SignupRequest
from app.services.exceptions import (
    AuthProviderError,
    DuplicateEmailError,
    InvalidCredentialsError,
    InvalidTokenError,
)

SUPABASE_AUTH_ERRORS = tuple(
    error_type
    for error_type in (GoTrueAuthApiError, SupabaseAuthApiError)
    if error_type is not None
)
SUPABASE_CLIENT_ERRORS = (*SUPABASE_AUTH_ERRORS, HTTPError)
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class CreatedAuthUser:
    id: UUID
    email: str


@dataclass(frozen=True)
class SupabaseAuthSession:
    user_id: UUID
    email: str
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    expires_at: int


@dataclass(frozen=True)
class SupabaseAuthenticatedUser:
    id: UUID
    email: str


class SupabaseAuthClient:
    def __init__(self) -> None:
        self._supabase_url = settings.SUPABASE_URL.rstrip("/")
        self._auth_admin = self._create_client(
            settings.SUPABASE_SERVICE_ROLE_KEY.get_secret_value()
        ).auth.admin
        self._public_client = self._create_client(settings.SUPABASE_ANON_KEY.get_secret_value())

    def create_signup_user(self, signup: SignupRequest) -> CreatedAuthUser:
        try:
            response = self._auth_admin.create_user(
                {
                    "email": str(signup.email).lower(),
                    "password": signup.password.get_secret_value(),
                    "email_confirm": True,
                    "user_metadata": {
                        "role": signup.role.value,
                        "first_name": signup.first_name,
                        "last_name": signup.last_name,
                    },
                }
            )
        except SUPABASE_CLIENT_ERRORS as exc:
            if self._is_duplicate_email_error(exc):
                raise DuplicateEmailError(
                    "This email is already registered in Supabase Auth."
                ) from exc
            raise AuthProviderError("Supabase Auth could not create this user.") from exc

        return self._created_user_from_response(response)

    def sign_in(self, signin: SigninRequest) -> SupabaseAuthSession:
        try:
            response = self._public_client.auth.sign_in_with_password(
                {
                    "email": str(signin.email).lower(),
                    "password": signin.password.get_secret_value(),
                }
            )
        except SUPABASE_CLIENT_ERRORS as exc:
            raise InvalidCredentialsError("Invalid email or password.") from exc

        user = self._read_user(response)
        session = self._read_session(response)
        user_id = self._read_value(user, "id")
        email = self._read_value(user, "email")
        access_token = self._read_value(session, "access_token")
        refresh_token = self._read_value(session, "refresh_token")
        token_type = self._read_value(session, "token_type")
        expires_in = self._read_value(session, "expires_in")
        expires_at = self._read_value(session, "expires_at")

        if (
            user_id is None
            or email is None
            or access_token is None
            or refresh_token is None
            or token_type is None
            or expires_in is None
            or expires_at is None
        ):
            raise AuthProviderError("Supabase Auth returned an incomplete signin response.")

        return SupabaseAuthSession(
            user_id=UUID(str(user_id)),
            email=str(email).lower(),
            access_token=str(access_token),
            refresh_token=str(refresh_token),
            token_type=str(token_type),
            expires_in=int(expires_in),
            expires_at=int(expires_at),
        )

    def get_user(self, access_token: str) -> SupabaseAuthenticatedUser:
        try:
            response = self._public_client.auth.get_user(access_token)
        except SUPABASE_CLIENT_ERRORS as exc:
            raise InvalidTokenError("Invalid or expired access token.") from exc

        user = self._read_user(response)
        user_id = self._read_value(user, "id")
        email = self._read_value(user, "email")

        if user_id is None or email is None:
            raise InvalidTokenError("Invalid or expired access token.")

        return SupabaseAuthenticatedUser(id=UUID(str(user_id)), email=str(email).lower())

    def delete_user(self, user_id: UUID) -> None:
        try:
            self._auth_admin.delete_user(str(user_id))
        except SUPABASE_CLIENT_ERRORS:
            logger.exception("Failed to delete Supabase Auth user %s during cleanup.", user_id)

    def _create_client(self, key: str) -> Client:
        return create_client(self._supabase_url, key.strip())

    @staticmethod
    def _created_user_from_response(response: Any) -> CreatedAuthUser:
        user = SupabaseAuthClient._read_user(response)
        user_id = SupabaseAuthClient._read_value(user, "id")
        email = SupabaseAuthClient._read_value(user, "email")

        if user_id is None or email is None:
            raise AuthProviderError("Supabase Auth returned an incomplete user response.")

        return CreatedAuthUser(id=UUID(str(user_id)), email=str(email).lower())

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
    def _is_duplicate_email_error(exc: BaseException) -> bool:
        message = str(exc).lower()
        return "email" in message and (
            "already been registered" in message or "already registered" in message
        )
