from uuid import UUID

from fastapi import APIRouter, Query, status

from app.api.deps import BlueprintServiceDep, CurrentUser, DbSession
from app.schemas.blueprints import (
    BlueprintCreate,
    BlueprintListResponse,
    BlueprintResponse,
    BlueprintUpdate,
    BlueprintVersionCreate,
    BlueprintVersionResponse,
)

router = APIRouter()


def _to_response(blueprint) -> BlueprintResponse:
    current_version = next((v for v in blueprint.versions if v.state.value == "current"), None)
    pending_version = next((v for v in blueprint.versions if v.state.value == "pending"), None)
    return BlueprintResponse(
        id=blueprint.id,
        founder_id=blueprint.founder_id,
        visibility=blueprint.visibility,
        created_at=blueprint.created_at,
        updated_at=blueprint.updated_at,
        current_version=(
            BlueprintVersionResponse.model_validate(current_version) if current_version else None
        ),
        pending_version=(
            BlueprintVersionResponse.model_validate(pending_version) if pending_version else None
        ),
    )


@router.get("", response_model=BlueprintListResponse)
def list_blueprints(
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> BlueprintListResponse:
    blueprints, total = service.list_blueprints(db, current_user, limit=limit, offset=offset)
    return BlueprintListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=[_to_response(blueprint) for blueprint in blueprints],
    )


@router.post("", response_model=BlueprintResponse, status_code=status.HTTP_201_CREATED)
def create_blueprint(
    payload: BlueprintCreate,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> BlueprintResponse:
    blueprint = service.create_blueprint(db, current_user, payload)
    return _to_response(blueprint)


@router.get("/{blueprint_id}", response_model=BlueprintResponse)
def get_blueprint(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> BlueprintResponse:
    blueprint = service.get_blueprint(db, blueprint_id, current_user, require_ownership=False)
    return _to_response(blueprint)


@router.patch("/{blueprint_id}", response_model=BlueprintResponse)
def update_blueprint(
    blueprint_id: UUID,
    payload: BlueprintUpdate,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> BlueprintResponse:
    blueprint = service.update_visibility(db, blueprint_id, current_user, payload)
    return _to_response(blueprint)


@router.delete("/{blueprint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blueprint(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> None:
    service.delete_blueprint(db, blueprint_id, current_user)


@router.post(
    "/{blueprint_id}/versions",
    response_model=BlueprintVersionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_pending_version(
    blueprint_id: UUID,
    payload: BlueprintVersionCreate,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> BlueprintVersionResponse:
    version = service.submit_pending_version(db, blueprint_id, current_user, payload)
    return BlueprintVersionResponse.model_validate(version)


@router.get("/{blueprint_id}/versions", response_model=list[BlueprintVersionResponse])
def list_versions(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> list[BlueprintVersionResponse]:
    versions = service.list_versions(db, blueprint_id, current_user)
    return [BlueprintVersionResponse.model_validate(version) for version in versions]


@router.get("/{blueprint_id}/versions/latest", response_model=BlueprintVersionResponse)
def get_latest_version(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> BlueprintVersionResponse:
    version = service.get_latest_version(db, blueprint_id, current_user)
    return BlueprintVersionResponse.model_validate(version)


@router.post("/{blueprint_id}/versions/promote", response_model=BlueprintVersionResponse)
def promote_pending_version(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> BlueprintVersionResponse:
    version = service.promote_pending_version(db, blueprint_id, current_user)
    return BlueprintVersionResponse.model_validate(version)
