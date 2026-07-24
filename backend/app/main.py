import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.error_handlers import register_exception_handlers
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import SessionLocal
from app.services.generation.blueprint_generation_service import fail_interrupted_generations

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    # In-process generations die on restart, orphaning their card at
    # `generating`. Clear those on boot so no blueprint shows as stuck.
    db = SessionLocal()
    try:
        swept = fail_interrupted_generations(db)
        if swept:
            logger.info("Startup: marked %d interrupted generation(s) as failed", swept)
    finally:
        db.close()
    yield


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        version="0.1.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):300[0-9]$"
        if settings.ENVIRONMENT == "local"
        else None,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(api_router, prefix=settings.API_V1_STR)
    register_exception_handlers(application)

    return application


app = create_application()
