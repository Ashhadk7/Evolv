import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.services.exceptions import AppError, ErrorCode

logger = logging.getLogger(__name__)

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
    ErrorCode.BLUEPRINT_AGENT_INPUT: status.HTTP_422_UNPROCESSABLE_CONTENT,
    ErrorCode.BLUEPRINT_GENERATION: status.HTTP_502_BAD_GATEWAY,
    ErrorCode.FOUNDER_PROFILE_REQUIRED: status.HTTP_403_FORBIDDEN,
    ErrorCode.DEVELOPER_PROFILE_REQUIRED: status.HTTP_403_FORBIDDEN,
    ErrorCode.ALREADY_APPLIED: status.HTTP_409_CONFLICT,
    ErrorCode.ALREADY_SAVED: status.HTTP_409_CONFLICT,
    ErrorCode.APPLICATION_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.SAVED_BLUEPRINT_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.APPLICATION_ACCESS_DENIED: status.HTTP_403_FORBIDDEN,
    ErrorCode.APPLICATION_PERSISTENCE: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ErrorCode.NOTIFICATION_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.NOTIFICATION_ACCESS_DENIED: status.HTTP_403_FORBIDDEN,
    ErrorCode.NOTIFICATION_PERSISTENCE: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ErrorCode.PROJECT_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.PROJECT_ACCESS_DENIED: status.HTTP_403_FORBIDDEN,
    ErrorCode.PROJECT_PERSISTENCE: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ErrorCode.PROJECT_INVALID_ASSIGNMENT: status.HTTP_400_BAD_REQUEST,
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
    @application.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        status_code = ERROR_STATUS_BY_CODE.get(exc.code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        detail = SAFE_DETAIL_BY_CODE.get(exc.code, exc.message)
        if status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
            logger.exception(
                "Application error on %s %s", request.method, request.url.path
            )
        return JSONResponse(
            status_code=status_code,
            content={"detail": detail, "code": exc.code.value},
            headers=ERROR_HEADERS_BY_CODE.get(exc.code),
        )

    @application.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "An unexpected server error occurred.",
                "code": "internal_error",
            },
        )
