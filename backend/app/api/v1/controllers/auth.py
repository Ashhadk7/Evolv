from fastapi import APIRouter, HTTPException, status

from app.api.deps import AuthServiceDep, DbSession
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
    SignupStartResponse,
    SignupVerifyEmailRequest,
)
from app.services.exceptions import (
    AuthProviderConfigurationError,
    AuthProviderError,
    AuthUserMismatchError,
    DuplicateEmailError,
    EmailDeliveryError,
    EmailOtpError,
    InvalidCredentialsError,
    ProfilePersistenceError,
)

router = APIRouter()


@router.post(
    "/signup",
    response_model=SignupStartResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_202_ACCEPTED,
)
def signup(
    signup_data: SignupRequest, db: DbSession, auth_service: AuthServiceDep
) -> SignupStartResponse:
    try:
        return auth_service.start_signup(db, signup_data)
    except DuplicateEmailError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except AuthProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase Auth is not configured.",
        ) from exc
    except AuthProviderError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except ProfilePersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Signup data could not be saved.",
        ) from exc


@router.post(
    "/signup/verify-email",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED,
)
def verify_signup_email(
    verification_data: SignupVerifyEmailRequest, db: DbSession, auth_service: AuthServiceDep
) -> SignupResponse:
    try:
        return auth_service.verify_signup_email(db, verification_data)
    except AuthUserMismatchError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except EmailOtpError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except ProfilePersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification could not be saved.",
        ) from exc


@router.post(
    "/signup/resend-otp",
    response_model=SignupStartResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_202_ACCEPTED,
)
def resend_signup_otp(
    resend_data: SignupResendOtpRequest, db: DbSession, auth_service: AuthServiceDep
) -> SignupStartResponse:
    try:
        return auth_service.resend_signup_otp(db, resend_data)
    except EmailOtpError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except ProfilePersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Verification code could not be updated.",
        ) from exc


@router.post("/signin", response_model=SigninResponse)
def signin(
    signin_data: SigninRequest, db: DbSession, auth_service: AuthServiceDep
) -> SigninResponse:
    try:
        return auth_service.signin(db, signin_data)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        ) from exc
    except EmailOtpError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
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
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def forgot_password(
    forgot_request: ForgotPasswordRequest, db: DbSession, auth_service: AuthServiceDep
) -> ForgotPasswordResponse:
    try:
        return auth_service.forgot_password(db, forgot_request)
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except ProfilePersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset code could not be saved.",
        ) from exc


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(
    reset_request: ResetPasswordRequest, db: DbSession, auth_service: AuthServiceDep
) -> ResetPasswordResponse:
    try:
        return auth_service.reset_password(db, reset_request)
    except EmailOtpError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except AuthProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except ProfilePersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset could not be completed.",
        ) from exc