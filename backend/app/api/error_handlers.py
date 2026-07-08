from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.services.exceptions import AppError, ErrorCode

ERROR_STATUS_BY_CODE = {
    ErrorCode.AUTH_CONFIGURATION: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ErrorCode.AUTH_PROVIDER: status.HTTP_400_BAD_REQUEST,
    ErrorCode.AUTH_USER_MISMATCH: status.HTTP_403_FORBIDDEN,
    ErrorCode.DUPLICATE_EMAIL: status.HTTP_409_CONFLICT,
    ErrorCode.EMAIL_DELIVERY: status.HTTP_502_BAD_GATEWAY,
    ErrorCode.INVALID_CREDENTIALS: status.HTTP_401_UNAUTHORIZED,
    ErrorCode.INVALID_OTP: status.HTTP_400_BAD_REQUEST,
    ErrorCode.INVALID_TOKEN: status.HTTP_401_UNAUTHORIZED,
    ErrorCode.PENDING_SIGNUP_EXPIRED: status.HTTP_410_GONE,
    ErrorCode.PENDING_SIGNUP_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.PROFILE_PERSISTENCE: status.HTTP_500_INTERNAL_SERVER_ERROR,
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
    application.add_exception_handler(AppError, app_error_handler)


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    del request
    return JSONResponse(
        status_code=ERROR_STATUS_BY_CODE[exc.code],
        content={"detail": SAFE_DETAIL_BY_CODE.get(exc.code, exc.message), "code": exc.code},
        headers=ERROR_HEADERS_BY_CODE.get(exc.code),
    )
