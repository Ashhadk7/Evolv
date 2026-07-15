from uuid import UUID
from typing import Any

from fastapi import APIRouter, Query, status, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.api.deps import CurrentUser, DbSession
from app.schemas.applications import SavedBlueprintResponse
from app.schemas.blueprints import (
    BlueprintCreate,
    BlueprintListResponse,
    BlueprintResponse,
    BlueprintUpdate,
    BlueprintVersionCreate,
    BlueprintVersionResponse,
)
from app.services import application_service, blueprint_service, chat_service

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


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    blueprint: dict[str, Any] | None = None


@router.post("/{blueprint_id}/chat")
async def blueprint_chat(
    blueprint_id: str,
    payload: ChatRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> StreamingResponse:
    try:
        stream = await chat_service.stream_blueprint_chat(
            blueprint_id=blueprint_id,
            db=db,
            messages=[m.model_dump() for m in payload.messages],
            blueprint_data=payload.blueprint,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    async def event_generator():
        async for token in stream:
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
