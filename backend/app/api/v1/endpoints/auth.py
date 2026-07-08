from fastapi import APIRouter, status

from app.api.deps import AuthServiceDep, DbSession
<<<<<<< HEAD
from app.schemas.auth import (
    SigninRequest,
    SigninResponse,
    SignupRequest,
    SignupResendOtpRequest,
    SignupResponse,
    SignupStartResponse,
    SignupVerifyEmailRequest,
)
=======
from app.schemas.auth import SigninRequest, SigninResponse, SignupRequest, SignupResponse
>>>>>>> 8526559 (Issues resolved.)

router = APIRouter()


<<<<<<< HEAD
@router.post(
    "/signup",
    response_model=SignupStartResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_202_ACCEPTED,
)
def signup(
    signup_data: SignupRequest, db: DbSession, auth_service: AuthServiceDep
) -> SignupStartResponse:
    return auth_service.start_signup(db, signup_data)


@router.post(
    "/signup/verify-email",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED,
)
def verify_signup_email(
    verification_data: SignupVerifyEmailRequest, db: DbSession, auth_service: AuthServiceDep
) -> SignupResponse:
    return auth_service.verify_signup_email(db, verification_data)


@router.post(
    "/signup/resend-otp",
    response_model=SignupStartResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_202_ACCEPTED,
)
def resend_signup_otp(
    resend_data: SignupResendOtpRequest, db: DbSession, auth_service: AuthServiceDep
) -> SignupStartResponse:
    return auth_service.resend_signup_otp(db, resend_data)
=======
@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(
    signup_data: SignupRequest,
    db: DbSession,
    auth_service: AuthServiceDep,
) -> SignupResponse:
    return auth_service.signup(db, signup_data)
>>>>>>> 8526559 (Issues resolved.)


@router.post("/signin", response_model=SigninResponse)
def signin(
<<<<<<< HEAD
    signin_data: SigninRequest, db: DbSession, auth_service: AuthServiceDep
=======
    signin_data: SigninRequest,
    db: DbSession,
    auth_service: AuthServiceDep,
>>>>>>> 8526559 (Issues resolved.)
) -> SigninResponse:
    return auth_service.signin(db, signin_data)
