from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Query, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.applications import (
    ApplicationCreate,
    ApplicationListResponse,
    ApplicationResponse,
    ApplicationUpdate,
)
from app.services import application_service
from app.services import message_websocket as message_websocket_service
from app.services import notifications_service
from app.schemas.notifications import NotificationResponse

router = APIRouter()


@router.get("", response_model=ApplicationListResponse)
def list_applications(
    db: DbSession,
    current_user: CurrentUser,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> ApplicationListResponse:
    applications, total = application_service.list_applications(
        db, current_user, limit=limit, offset=offset
    )
    return ApplicationListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=applications,
    )


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreate,
    background_tasks: BackgroundTasks,
    db: DbSession,
    current_user: CurrentUser,
) -> ApplicationResponse:
    application = application_service.create_application(
        db, current_user, payload.blueprint_id, role=payload.role
    )
    notification = notifications_service.notify_application_created(
        db,
        application_id=application.id,
        developer=current_user,
    )
    if notification is not None:
        background_tasks.add_task(
            message_websocket_service.publish_notification_created,
            notification.user_id,
            NotificationResponse.model_validate(notification),
        )
    return ApplicationResponse.model_validate(application)


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: UUID,
    payload: ApplicationUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> ApplicationResponse:
    application = application_service.update_application(
        db, application_id, current_user, payload.connection_id
    )
    return ApplicationResponse.model_validate(application)


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(application_id: UUID, db: DbSession, current_user: CurrentUser) -> None:
    application_service.delete_application(db, application_id, current_user)
