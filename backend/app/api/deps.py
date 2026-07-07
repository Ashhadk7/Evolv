from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.repositories import users as users_repository
from app.services.exceptions import AuthProviderConfigurationError, InvalidTokenError
from app.services.auth_service import AuthService
from app.services.supabase_auth import SupabaseAuthClient

DbSession = Annotated[Session, Depends(get_db)]
bearer_scheme = HTTPBearer(auto_error=False)


def get_auth_service() -> AuthService:
    return AuthService(auth_provider=SupabaseAuthClient())


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        auth_user = SupabaseAuthClient().get_user(credentials.credentials)
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
