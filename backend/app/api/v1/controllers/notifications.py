from uuid import UUID

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.notifications import (
    NotificationListResponse,
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate,
    NotificationResponse,
)
from app.services import notifications_service

router = APIRouter()


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    db: DbSession,
    current_user: CurrentUser,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> NotificationListResponse:
    items, total = notifications_service.list_notifications(
        db, current_user, limit=limit, offset=offset
    )
    return NotificationListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=[NotificationResponse.model_validate(n) for n in items],
    )


@router.get("/preferences", response_model=NotificationPreferencesResponse)
def get_notification_preferences(
    current_user: CurrentUser,
) -> NotificationPreferencesResponse:
    return NotificationPreferencesResponse(
        preferences=notifications_service.get_preferences(current_user)
    )


@router.patch("/preferences", response_model=NotificationPreferencesResponse)
def update_notification_preferences(
    payload: NotificationPreferencesUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> NotificationPreferencesResponse:
    preferences = notifications_service.update_preferences(
        db,
        current_user,
        payload.preferences,
    )
    return NotificationPreferencesResponse(preferences=preferences)


@router.patch("/{notification_id}", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> NotificationResponse:
    notification = notifications_service.mark_read(db, notification_id, current_user)
    return NotificationResponse.model_validate(notification)


@router.post("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_notifications_read(
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    notifications_service.mark_all_read(db, current_user)
