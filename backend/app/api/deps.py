from functools import lru_cache
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.repositories import users as users_repository
from app.services.auth_service import AuthService
from app.services.email_sender import SmtpEmailSender
from app.services.exceptions import AuthProviderConfigurationError, InvalidTokenError
from app.services.supabase_auth import SupabaseAuthClient

DbSession = Annotated[Session, Depends(get_db)]
bearer_scheme = HTTPBearer()


@lru_cache
def get_supabase_auth_client() -> SupabaseAuthClient:
    return SupabaseAuthClient()


@lru_cache
def get_email_sender() -> SmtpEmailSender:
    return SmtpEmailSender()


SupabaseAuthClientDep = Annotated[SupabaseAuthClient, Depends(get_supabase_auth_client)]
EmailSenderDep = Annotated[SmtpEmailSender, Depends(get_email_sender)]


def get_auth_service(
    auth_client: SupabaseAuthClientDep, email_sender: EmailSenderDep
) -> AuthService:
    return AuthService(auth_client=auth_client, email_sender=email_sender)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


def get_access_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
) -> str:
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials


AccessToken = Annotated[str, Depends(get_access_token)]


def get_current_user(
    db: DbSession, access_token: AccessToken, auth_client: SupabaseAuthClientDep
) -> User:
    try:
        auth_user = auth_client.get_user(access_token)
    except AuthProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase Auth is not configured.",
        ) from exc
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    app_user = users_repository.get_user_by_id(db, auth_user.id)
    if app_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user is not registered in the application.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return app_user


CurrentUser = Annotated[User, Depends(get_current_user)]
