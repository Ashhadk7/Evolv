from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import BlueprintServiceDep, CurrentUser, DbSession
from app.schemas.blueprints import (
    BlueprintCreate,
    BlueprintListResponse,
    BlueprintResponse,
    BlueprintUpdate,
    BlueprintVersionCreate,
    BlueprintVersionResponse,
)
from app.services.exceptions import (
    BlueprintAccessDeniedError,
    BlueprintNotFoundError,
    BlueprintPersistenceError,
    BlueprintVersionNotFoundError,
    FounderProfileRequiredError,
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
    try:
        blueprints, total = service.list_blueprints(db, current_user, limit=limit, offset=offset)
    except FounderProfileRequiredError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

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
    try:
        blueprint = service.create_blueprint(db, current_user, payload)
    except FounderProfileRequiredError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except BlueprintPersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        ) from exc

    return _to_response(blueprint)


@router.get("/{blueprint_id}", response_model=BlueprintResponse)
def get_blueprint(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> BlueprintResponse:
    try:
        blueprint = service.get_blueprint(db, blueprint_id, current_user, require_ownership=False)
    except BlueprintNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except BlueprintAccessDeniedError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    return _to_response(blueprint)


@router.patch("/{blueprint_id}", response_model=BlueprintResponse)
def update_blueprint(
    blueprint_id: UUID,
    payload: BlueprintUpdate,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> BlueprintResponse:
    try:
        blueprint = service.update_visibility(db, blueprint_id, current_user, payload)
    except BlueprintNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except BlueprintAccessDeniedError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except BlueprintPersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        ) from exc

    return _to_response(blueprint)


@router.delete("/{blueprint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blueprint(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> None:
    try:
        service.delete_blueprint(db, blueprint_id, current_user)
    except BlueprintNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except BlueprintAccessDeniedError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except BlueprintPersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        ) from exc


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
    try:
        version = service.submit_pending_version(db, blueprint_id, current_user, payload)
    except BlueprintNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except BlueprintAccessDeniedError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except BlueprintPersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        ) from exc

    return BlueprintVersionResponse.model_validate(version)


@router.get("/{blueprint_id}/versions", response_model=list[BlueprintVersionResponse])
def list_versions(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> list[BlueprintVersionResponse]:
    try:
        versions = service.list_versions(db, blueprint_id, current_user)
    except BlueprintNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except BlueprintAccessDeniedError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    return [BlueprintVersionResponse.model_validate(version) for version in versions]


@router.get("/{blueprint_id}/versions/latest", response_model=BlueprintVersionResponse)
def get_latest_version(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> BlueprintVersionResponse:
    try:
        version = service.get_latest_version(db, blueprint_id, current_user)
    except BlueprintNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except BlueprintAccessDeniedError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except BlueprintVersionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return BlueprintVersionResponse.model_validate(version)


@router.post("/{blueprint_id}/versions/promote", response_model=BlueprintVersionResponse)
def promote_pending_version(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    service: BlueprintServiceDep,
) -> BlueprintVersionResponse:
    try:
        version = service.promote_pending_version(db, blueprint_id, current_user)
    except BlueprintNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except BlueprintAccessDeniedError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except BlueprintVersionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except BlueprintPersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        ) from exc

    return BlueprintVersionResponse.model_validate(version)
