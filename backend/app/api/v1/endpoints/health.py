from fastapi import APIRouter

from app.core.config import settings
from app.schemas.health import HealthCheck

router = APIRouter()


@router.get("", response_model=HealthCheck)
def health_check() -> HealthCheck:
    return HealthCheck(
        status="ok",
        service=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
    )
