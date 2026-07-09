from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.services.exceptions import AppError, ErrorCode

ERROR_STATUS_BY_CODE = {
    ErrorCode.AUTH_CONFIGURATION: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ErrorCode.AUTH_PROVIDER: status.HTTP_400_BAD_REQUEST,
    ErrorCode.AUTH_USER_MISMATCH: status.HTTP_403_FORBIDDEN,
    ErrorCode.DUPLICATE_EMAIL: status.HTTP_409_CONFLICT,
    ErrorCode.EMAIL_DELIVERY: status.HTTP_502_BAD_GATEWAY,
    ErrorCode.EMAIL_NOT_VERIFIED: status.HTTP_403_FORBIDDEN,
    ErrorCode.INVALID_CREDENTIALS: status.HTTP_401_UNAUTHORIZED,
    ErrorCode.INVALID_OTP: status.HTTP_400_BAD_REQUEST,
    ErrorCode.INVALID_TOKEN: status.HTTP_401_UNAUTHORIZED,
    ErrorCode.PROFILE_PERSISTENCE: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ErrorCode.SIGNUP_EXPIRED: status.HTTP_410_GONE,
    ErrorCode.SIGNUP_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.BLUEPRINT_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.BLUEPRINT_ACCESS_DENIED: status.HTTP_403_FORBIDDEN,
    ErrorCode.BLUEPRINT_PERSISTENCE: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ErrorCode.BLUEPRINT_VERSION_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.FOUNDER_PROFILE_REQUIRED: status.HTTP_403_FORBIDDEN,
    ErrorCode.NO_PENDING_VERSION: status.HTTP_409_CONFLICT,
    ErrorCode.DEVELOPER_PROFILE_REQUIRED: status.HTTP_403_FORBIDDEN,
    ErrorCode.ALREADY_APPLIED: status.HTTP_409_CONFLICT,
    ErrorCode.ALREADY_SAVED: status.HTTP_409_CONFLICT,
    ErrorCode.APPLICATION_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.SAVED_BLUEPRINT_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.APPLICATION_ACCESS_DENIED: status.HTTP_403_FORBIDDEN,
    ErrorCode.APPLICATION_PERSISTENCE: status.HTTP_500_INTERNAL_SERVER_ERROR,
}

SAFE_DETAIL_BY_CODE = {
    ErrorCode.AUTH_CONFIGURATION: "Supabase Auth is not configured.",
    ErrorCode.INVALID_CREDENTIALS: "Invalid email or password.",
    ErrorCode.INVALID_TOKEN: "Invalid or expired access token.",
}

ERROR_HEADERS_BY_CODE = {
    ErrorCode.INVALID_TOKEN: {"WWW-Authenticate": "Bearer"},
}


def register_exception_handlers(application: FastAPI) -> None:
    del application
