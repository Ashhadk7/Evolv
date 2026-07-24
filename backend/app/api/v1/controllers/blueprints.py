from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Query, status

from app.api.deps import CurrentFounder, CurrentUser, DbSession
from app.schemas.applications import (
    BlueprintApplicationCountResponse,
    BlueprintApplicationCountsResponse,
    BlueprintApplicationListResponse,
    BlueprintApplicationResponse,
    SavedBlueprintResponse,
)
from app.schemas.notifications import NotificationResponse
from app.schemas.blueprints import (
    BlueprintContentUpdate,
    BlueprintCreate,
    BlueprintGenerateRequest,
    BlueprintListResponse,
    BlueprintResponse,
    BlueprintUpdate,
    BlueprintRefineRequest,
    BlueprintRefineResponse,
    ChatRequest,
    ChatResponse,
)
from app.models.blueprint import BlueprintVisibility
from app.services import application_service, blueprint_service, chat_service
from app.services.generation import blueprint_generation_service
from app.services import message_websocket as message_websocket_service
from app.services import notifications_service, refine_service

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


@router.post("/{blueprint_id}/retry", response_model=BlueprintResponse)
async def retry_blueprint(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentFounder,
    background_tasks: BackgroundTasks,
) -> BlueprintResponse:
    # Re-run generation on the SAME blueprint (no duplicate). Authorize ownership
    # first, then reset to `generating` and schedule the pipeline in the background.
    blueprint_service.get_blueprint(db, blueprint_id, current_user, require_ownership=True)
    blueprint, payload = blueprint_generation_service.retry_generation(db, blueprint_id)
    background_tasks.add_task(
        blueprint_generation_service.run_generation, blueprint.id, payload
    )
    return BlueprintResponse.model_validate(blueprint)


@router.get("/application-counts", response_model=BlueprintApplicationCountsResponse)
def count_blueprint_applications(
    db: DbSession,
    current_user: CurrentFounder,
) -> BlueprintApplicationCountsResponse:
    counts, in_conversation_counts, total, in_conversation = (
        application_service.count_blueprint_applications(db, current_user)
    )
    return BlueprintApplicationCountsResponse(
        total=total,
        in_conversation=in_conversation,
        items=[
            BlueprintApplicationCountResponse(
                blueprint_id=blueprint_id,
                count=count,
                in_conversation=in_conversation_counts.get(blueprint_id, 0),
            )
            for blueprint_id, count in sorted(counts.items(), key=lambda item: str(item[0]))
        ],
    )


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
    blueprint_id: UUID,
    payload: BlueprintUpdate,
    db: DbSession,
    current_user: CurrentFounder,
    background_tasks: BackgroundTasks,
) -> BlueprintResponse:
    current_blueprint = blueprint_service.get_blueprint(
        db,
        blueprint_id,
        current_user,
        require_ownership=True,
    )
    was_private = current_blueprint.visibility != BlueprintVisibility.PUBLIC
    blueprint = blueprint_service.update_visibility(db, blueprint_id, current_user, payload)
    if was_private and blueprint.visibility == BlueprintVisibility.PUBLIC:
        notifications = notifications_service.notify_blueprint_published(
            db,
            blueprint_id=blueprint.id,
            founder=current_user,
        )
        for notification in notifications:
            background_tasks.add_task(
                message_websocket_service.publish_notification_created,
                notification.user_id,
                NotificationResponse.model_validate(notification),
            )
    return BlueprintResponse.model_validate(blueprint)


@router.patch("/{blueprint_id}/content", response_model=BlueprintResponse)
def update_blueprint_content(
    blueprint_id: UUID,
    payload: BlueprintContentUpdate,
    db: DbSession,
    current_user: CurrentFounder,
) -> BlueprintResponse:
    blueprint = blueprint_service.update_content(db, blueprint_id, current_user, payload)
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


@router.post("/{blueprint_id}/refine", response_model=BlueprintRefineResponse)
async def refine_blueprint(
    blueprint_id: UUID,
    payload: BlueprintRefineRequest,
    db: DbSession,
    current_user: CurrentFounder,
    background_tasks: BackgroundTasks,
) -> BlueprintRefineResponse:
    """Re-run a single targeted agent with founder feedback and patch the result
    back into the blueprint's current version. Returns immediately; the agent
    runs in the background (same pattern as /generate)."""
    # Verify the blueprint belongs to this founder before queuing the task
    blueprint_service.get_blueprint(db, blueprint_id, current_user, require_ownership=True)
    refine_service.mark_refinement_started(db, blueprint_id, payload.section)
    background_tasks.add_task(
        refine_service.refine_section,
        blueprint_id,
        payload.section,
        payload.feedback,
    )
    return BlueprintRefineResponse(
        blueprint_id=str(blueprint_id),
        section=payload.section,
        status="queued",
        message=f"Refining {payload.section!r} in the background. Refresh the blueprint in ~15s to see the update.",
    )
