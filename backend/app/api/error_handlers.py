import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.config import settings

logger = logging.getLogger(__name__)

def register_exception_handlers(application: FastAPI) -> None:
    @application.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled API error on %s %s", request.method, request.url.path)
        detail = str(exc) if settings.ENVIRONMENT == "local" else "Internal server error."
        return JSONResponse(status_code=500, content={"detail": detail})
