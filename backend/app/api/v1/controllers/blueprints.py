from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Query, status

from app.api.deps import CurrentFounder, CurrentUser, DbSession
from app.schemas.applications import (
    BlueprintApplicationListResponse,
    BlueprintApplicationResponse,
    SavedBlueprintResponse,
)
from app.schemas.blueprints import (
    BlueprintCreate,
    BlueprintGenerateRequest,
    BlueprintListResponse,
    BlueprintResponse,
    BlueprintUpdate,
    ChatRequest,
    ChatResponse,
)
from app.services import application_service, blueprint_service, chat_service
from app.services.generation import blueprint_generation_service

router = APIRouter()


@router.get("", response_model=BlueprintListResponse)
def list_blueprints(
    db: DbSession,
    current_user: CurrentFounder,
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
def create_blueprint(
    payload: BlueprintCreate, db: DbSession, current_user: CurrentFounder
) -> BlueprintResponse:
    blueprint = blueprint_service.create_blueprint(db, current_user, payload)
    return BlueprintResponse.model_validate(blueprint)


@router.post("/generate", response_model=BlueprintResponse, status_code=status.HTTP_201_CREATED)
async def generate_blueprint(
    payload: BlueprintGenerateRequest,
    db: DbSession,
    current_user: CurrentFounder,
    background_tasks: BackgroundTasks,
) -> BlueprintResponse:
    # Return the blueprint in a `generating` state right away; the agent pipeline
    # runs in the background so this request doesn't block (and can't time out).
    blueprint = blueprint_generation_service.start_generation(db, current_user, payload)
    background_tasks.add_task(
        blueprint_generation_service.run_generation, blueprint.id, payload
    )
    return BlueprintResponse.model_validate(blueprint)


@router.get("/{blueprint_id}", response_model=BlueprintResponse)
def get_blueprint(
    blueprint_id: UUID, db: DbSession, current_user: CurrentUser
) -> BlueprintResponse:
    blueprint = blueprint_service.get_blueprint(
        db, blueprint_id, current_user, require_ownership=False
    )
    return BlueprintResponse.model_validate(blueprint)


@router.patch("/{blueprint_id}", response_model=BlueprintResponse)
def update_blueprint(
    blueprint_id: UUID, payload: BlueprintUpdate, db: DbSession, current_user: CurrentFounder
) -> BlueprintResponse:
    blueprint = blueprint_service.update_visibility(db, blueprint_id, current_user, payload)
    return BlueprintResponse.model_validate(blueprint)


@router.delete("/{blueprint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blueprint(blueprint_id: UUID, db: DbSession, current_user: CurrentFounder) -> None:
    blueprint_service.delete_blueprint(db, blueprint_id, current_user)


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


@router.post("/{blueprint_id}/chat", response_model=ChatResponse)
def blueprint_chat(
    blueprint_id: UUID,
    payload: ChatRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> ChatResponse:
    blueprint_data = blueprint_service.get_blueprint_dict(db, blueprint_id, current_user)
    messages_list = [{"role": msg.role, "content": msg.content} for msg in payload.messages]
    reply = chat_service.get_chat_response(messages_list, blueprint_data)
    return ChatResponse(response=reply)


@router.get(
    "/{blueprint_id}/applications",
    response_model=BlueprintApplicationListResponse,
)
def list_blueprint_applications(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentFounder,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> BlueprintApplicationListResponse:
    items, total = application_service.list_blueprint_applications(
        db, blueprint_id, current_user, limit=limit, offset=offset
    )
    return BlueprintApplicationListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=[BlueprintApplicationResponse.model_validate(a) for a in items],
    )
