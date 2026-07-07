from __future__ import annotations

from typing import Protocol
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import UserRole
from app.repositories import users as users_repository
from app.schemas.auth import SigninRequest, SigninResponse, SignupRequest, SignupResponse, SignupRole
from app.services.exceptions import (
    AuthUserMismatchError,
    DuplicateEmailError,
    InvalidCredentialsError,
    ProfilePersistenceError,
)
from app.services.supabase_auth import CreatedAuthUser, SupabaseAuthSession


class AuthProvider(Protocol):
    def create_user(self, signup: SignupRequest) -> CreatedAuthUser:
        pass

    def sign_in(self, signin: SigninRequest) -> SupabaseAuthSession:
        pass

    def delete_user(self, user_id: UUID) -> None:
        pass


class AuthService:
    def __init__(self, auth_provider: AuthProvider) -> None:
        self._auth_provider = auth_provider

    def signup(self, db: Session, signup: SignupRequest) -> SignupResponse:
        existing_user = users_repository.get_user_by_email(db, str(signup.email))
        if existing_user is not None:
            raise DuplicateEmailError("A user with this email already exists.")

        auth_user = self._auth_provider.create_user(signup)

        try:
            app_user = users_repository.create_user(
                db=db,
                user_id=auth_user.id,
                signup=signup,
                password_placeholder=settings.SUPABASE_AUTH_PASSWORD_HASH_PLACEHOLDER,
            )

            if signup.role.value == UserRole.FOUNDER.value:
                users_repository.create_founder_profile(db, auth_user.id, signup.founder_details)
            else:
                users_repository.create_developer_profile(
                    db,
                    auth_user.id,
                    signup.developer_details,
                )

            db.commit()
            db.refresh(app_user)
        except SQLAlchemyError as exc:
            db.rollback()
            self._auth_provider.delete_user(auth_user.id)
            raise ProfilePersistenceError("Application profile data could not be saved.") from exc

        return SignupResponse(
            id=app_user.id,
            email=app_user.email,
            role=signup.role,
            first_name=app_user.first_name,
            last_name=app_user.last_name,
            email_confirmed=auth_user.email_confirmed,
            message="Signup successful.",
        )

    def signin(self, db: Session, signin: SigninRequest) -> SigninResponse:
        app_user = users_repository.get_user_by_email(db, str(signin.email))
        if app_user is None:
            raise InvalidCredentialsError("Invalid email or password.")

        auth_session = self._auth_provider.sign_in(signin)
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
