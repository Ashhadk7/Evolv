from uuid import UUID

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.applications import SavedBlueprintResponse
from app.schemas.blueprints import (
    BlueprintCompetitorResponse,
    BlueprintCreate,
    BlueprintGenerateRequest,
    BlueprintListResponse,
    BlueprintMarketResponse,
    BlueprintPersonaResponse,
    BlueprintPositioningResponse,
    BlueprintResponse,
    BlueprintUpdate,
    BlueprintVersionCreate,
    BlueprintVersionResponse,
)
from app.services import application_service, blueprint_service
from app.services.generation import (
    blueprint_generation_service,
    competitor_service,
    market_service,
    persona_service,
    positioning_service,
)

router = APIRouter()


@router.get("", response_model=BlueprintListResponse)
def list_blueprints(
    db: DbSession,
    current_user: CurrentUser,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> BlueprintListResponse:
    blueprints, total = blueprint_service.list_blueprints(
        db, current_user, limit=limit, offset=offset
    )
    return BlueprintListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=blueprints,
    )


@router.post("", response_model=BlueprintResponse, status_code=status.HTTP_201_CREATED)
def create_blueprint(payload: BlueprintCreate, db: DbSession, current_user: CurrentUser) -> BlueprintResponse:
    blueprint = blueprint_service.create_blueprint(db, current_user, payload)
    return BlueprintResponse.model_validate(blueprint)


@router.post("/generate", response_model=BlueprintResponse, status_code=status.HTTP_201_CREATED)
async def generate_blueprint(
    payload: BlueprintGenerateRequest, db: DbSession, current_user: CurrentUser
) -> BlueprintResponse:
    blueprint = await blueprint_generation_service.generate_blueprint_from_intake(
        db, current_user, payload
    )
    return BlueprintResponse.model_validate(blueprint)


@router.get("/{blueprint_id}", response_model=BlueprintResponse)
def get_blueprint(blueprint_id: UUID, db: DbSession, current_user: CurrentUser) -> BlueprintResponse:
    blueprint = blueprint_service.get_blueprint(
        db, blueprint_id, current_user, require_ownership=False
    )
    return BlueprintResponse.model_validate(blueprint)


@router.patch("/{blueprint_id}", response_model=BlueprintResponse)
def update_blueprint(
    blueprint_id: UUID, payload: BlueprintUpdate, db: DbSession, current_user: CurrentUser
) -> BlueprintResponse:
    blueprint = blueprint_service.update_visibility(db, blueprint_id, current_user, payload)
    return BlueprintResponse.model_validate(blueprint)


@router.delete("/{blueprint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blueprint(blueprint_id: UUID, db: DbSession, current_user: CurrentUser) -> None:
    blueprint_service.delete_blueprint(db, blueprint_id, current_user)


@router.post(
    "/{blueprint_id}/versions",
    response_model=BlueprintVersionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_pending_version(
    blueprint_id: UUID, payload: BlueprintVersionCreate, db: DbSession, current_user: CurrentUser
) -> BlueprintVersionResponse:
    version = blueprint_service.submit_pending_version(db, blueprint_id, current_user, payload)
    return BlueprintVersionResponse.model_validate(version)


@router.get("/{blueprint_id}/versions", response_model=list[BlueprintVersionResponse])
def list_versions(blueprint_id: UUID, db: DbSession, current_user: CurrentUser) -> list[BlueprintVersionResponse]:
    versions = blueprint_service.list_versions(db, blueprint_id, current_user)
    return versions


@router.get("/{blueprint_id}/versions/latest", response_model=BlueprintVersionResponse)
def get_latest_version(
    blueprint_id: UUID, db: DbSession, current_user: CurrentUser
) -> BlueprintVersionResponse:
    version = blueprint_service.get_latest_version(db, blueprint_id, current_user)
    return BlueprintVersionResponse.model_validate(version)


@router.post("/{blueprint_id}/agents/positioning", response_model=BlueprintPositioningResponse)
async def generate_positioning(
    blueprint_id: UUID, db: DbSession, current_user: CurrentUser
) -> BlueprintPositioningResponse:
    version, positioning = await positioning_service.generate_positioning_for_blueprint(
        db, blueprint_id, current_user
    )
    return BlueprintPositioningResponse(
        blueprint_id=blueprint_id,
        version_id=version.id,
        version_state=version.state,
        positioning=positioning.model_dump(by_alias=True),
        content_json=version.content_json or {},
    )


@router.post("/{blueprint_id}/agents/market", response_model=BlueprintMarketResponse)
async def generate_market(
    blueprint_id: UUID, db: DbSession, current_user: CurrentUser
) -> BlueprintMarketResponse:
    version, market = await market_service.generate_market_for_blueprint(
        db, blueprint_id, current_user
    )
    return BlueprintMarketResponse(
        blueprint_id=blueprint_id,
        version_id=version.id,
        version_state=version.state,
        market=market.model_dump(by_alias=True),
        content_json=version.content_json or {},
    )


@router.post("/{blueprint_id}/agents/competitor", response_model=BlueprintCompetitorResponse)
async def generate_competitor(
    blueprint_id: UUID, db: DbSession, current_user: CurrentUser
) -> BlueprintCompetitorResponse:
    version, competitor = await competitor_service.generate_competitor_for_blueprint(
        db, blueprint_id, current_user
    )
    return BlueprintCompetitorResponse(
        blueprint_id=blueprint_id,
        version_id=version.id,
        version_state=version.state,
        competitor=competitor.model_dump(by_alias=True),
        content_json=version.content_json or {},
    )


@router.post("/{blueprint_id}/agents/persona", response_model=BlueprintPersonaResponse)
async def generate_persona(
    blueprint_id: UUID, db: DbSession, current_user: CurrentUser
) -> BlueprintPersonaResponse:
    version, persona = await persona_service.generate_persona_for_blueprint(
        db, blueprint_id, current_user
    )
    return BlueprintPersonaResponse(
        blueprint_id=blueprint_id,
        version_id=version.id,
        version_state=version.state,
        persona=persona.model_dump(by_alias=True),
        content_json=version.content_json or {},
    )


@router.post("/{blueprint_id}/versions/promote", response_model=BlueprintVersionResponse)
def promote_pending_version(
    blueprint_id: UUID, db: DbSession, current_user: CurrentUser
) -> BlueprintVersionResponse:
    version = blueprint_service.promote_pending_version(db, blueprint_id, current_user)
    return BlueprintVersionResponse.model_validate(version)


@router.post(
    "/{blueprint_id}/save",
    response_model=SavedBlueprintResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_blueprint(
    blueprint_id: UUID, db: DbSession, current_user: CurrentUser
) -> SavedBlueprintResponse:
    saved = application_service.save_blueprint(db, current_user, blueprint_id)
    return SavedBlueprintResponse.model_validate(saved)


@router.delete("/{blueprint_id}/save", status_code=status.HTTP_204_NO_CONTENT)
def unsave_blueprint(blueprint_id: UUID, db: DbSession, current_user: CurrentUser) -> None:
    application_service.unsave_blueprint(db, current_user, blueprint_id)
