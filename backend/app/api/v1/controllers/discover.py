from __future__ import annotations

from fastapi import APIRouter, Query

from app.api.deps import CurrentDeveloper, DbSession
from app.schemas.discover import DiscoverBlueprintListResponse, SavedDiscoverBlueprintListResponse
from app.services import discover_service

router = APIRouter()


@router.get("/blueprints", response_model=DiscoverBlueprintListResponse)
def list_public_blueprints(
    db: DbSession,
    current_user: CurrentDeveloper,
    industry: str | None = Query(default=None, max_length=255),
    stage: str | None = Query(default=None, max_length=120),
    tech: str | None = Query(default=None, max_length=120),
    min_viability: int | None = Query(default=None, ge=0, le=100),
    q: str | None = Query(default=None, max_length=120),
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> DiscoverBlueprintListResponse:
    return discover_service.list_public_blueprints(
        db,
        current_user,
        industry=industry,
        stage=stage,
        tech=tech,
        min_viability=min_viability,
        q=q,
        limit=limit,
        offset=offset,
    )


@router.get("/saved-blueprints", response_model=SavedDiscoverBlueprintListResponse)
def list_saved_blueprints(
    db: DbSession,
    current_user: CurrentDeveloper,
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> SavedDiscoverBlueprintListResponse:
    return discover_service.list_saved_blueprints(
        db,
        current_user,
        limit=limit,
        offset=offset,
    )
