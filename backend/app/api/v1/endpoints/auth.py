from fastapi import APIRouter, HTTPException, status

from app.api.deps import AuthServiceDep, DbSession
from app.schemas.auth import SigninRequest, SigninResponse, SignupRequest, SignupResponse
from app.services.exceptions import (
    AuthUserMismatchError,
    AuthProviderConfigurationError,
    AuthProviderError,
    DuplicateEmailError,
    InvalidCredentialsError,
    ProfilePersistenceError,
)

router = APIRouter()


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(signup_data: SignupRequest, db: DbSession, auth_service: AuthServiceDep) -> SignupResponse:
    try:
        return auth_service.signup(db, signup_data)
    except DuplicateEmailError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except AuthProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase Auth is not configured.",
        ) from exc
    except AuthProviderError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except ProfilePersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Signup auth user was created, but profile data could not be saved.",
        ) from exc


@router.post("/signin", response_model=SigninResponse)
def signin(signin_data: SigninRequest, db: DbSession, auth_service: AuthServiceDep) -> SigninResponse:
    try:
        return auth_service.signin(db, signin_data)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        ) from exc
    except AuthUserMismatchError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This auth account is not linked to the application user.",
        ) from exc
    except AuthProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase Auth is not configured.",
        ) from exc
    except AuthProviderError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
