from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.services.exceptions import (
    AuthProviderConfigurationError,
    AuthProviderError,
    AuthUserMismatchError,
    DuplicateEmailError,
    EmailDeliveryConfigurationError,
    EmailDeliveryError,
    EmailOtpError,
    InvalidCredentialsError,
    PendingSignupExpiredError,
    PendingSignupNotFoundError,
    ProfilePersistenceError,
)

ExceptionHandler = Callable[[Request, Exception], Awaitable[JSONResponse]]


def register_exception_handlers(application: FastAPI) -> None:
    application.add_exception_handler(
        DuplicateEmailError,
        _json_error(status.HTTP_409_CONFLICT),
    )
    application.add_exception_handler(
        AuthProviderConfigurationError,
        _json_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Supabase Auth is not configured."),
    )
    application.add_exception_handler(
        AuthProviderError,
        _json_error(status.HTTP_400_BAD_REQUEST),
    )
    application.add_exception_handler(
        EmailDeliveryConfigurationError,
        _json_error(status.HTTP_500_INTERNAL_SERVER_ERROR),
    )
    application.add_exception_handler(
        EmailDeliveryError,
        _json_error(status.HTTP_502_BAD_GATEWAY),
    )
    application.add_exception_handler(
        PendingSignupNotFoundError,
        _json_error(status.HTTP_404_NOT_FOUND),
    )
    application.add_exception_handler(
        PendingSignupExpiredError,
        _json_error(status.HTTP_410_GONE),
    )
    application.add_exception_handler(
        EmailOtpError,
        _json_error(status.HTTP_400_BAD_REQUEST),
    )
    application.add_exception_handler(
        ProfilePersistenceError,
        _json_error(status.HTTP_500_INTERNAL_SERVER_ERROR),
    )
    application.add_exception_handler(
        InvalidCredentialsError,
        _json_error(status.HTTP_401_UNAUTHORIZED, "Invalid email or password."),
    )
    application.add_exception_handler(
        AuthUserMismatchError,
        _json_error(status.HTTP_403_FORBIDDEN),
    )


def _json_error(status_code: int, detail: str | None = None) -> ExceptionHandler:
    async def handler(request: Request, exc: Exception) -> JSONResponse:
        del request
        return JSONResponse(
            status_code=status_code,
            content={"detail": detail or str(exc)},
        )

    return handler
