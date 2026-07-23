from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Query, WebSocket

from app.api.deps import CurrentUser, DbSession
from app.schemas.messages import (
    ConversationListResponse,
    InboxResponse,
    MarkReadResponse,
    MessageParticipantLookupResponse,
    MessageListResponse,
    PresenceResponse,
    RequestActionResponse,
    StartConversationRequest,
    StartConversationResponse,
)
from app.services import message_websocket as message_websocket_service
from app.services import messages as message_service
from app.services import notifications_service
from app.schemas.notifications import NotificationResponse

router = APIRouter()

LimitQuery = Annotated[int, Query(ge=1, le=100)]
OffsetQuery = Annotated[int, Query(ge=0)]


@router.get("/inbox", response_model=InboxResponse)
def get_inbox(db: DbSession, current_user: CurrentUser) -> InboxResponse:
    return message_service.list_inbox(db, current_user)


@router.get("/presence", response_model=PresenceResponse)
def get_presence(current_user: CurrentUser) -> PresenceResponse:
    return PresenceResponse(
        online_user_ids=message_websocket_service.message_websocket_manager.online_user_ids
    )


@router.get("/participants/lookup", response_model=MessageParticipantLookupResponse)
def find_participant(
    email: Annotated[str, Query(min_length=3, max_length=320)],
    db: DbSession,
    current_user: CurrentUser,
) -> MessageParticipantLookupResponse:
    return message_service.find_participant(db, email=email, current_user=current_user)


@router.get("/conversations", response_model=ConversationListResponse)
def list_conversations(db: DbSession, current_user: CurrentUser) -> ConversationListResponse:
    return message_service.list_conversations(db, current_user)


@router.post("/conversations", response_model=StartConversationResponse)
async def start_conversation(
    payload: StartConversationRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> StartConversationResponse:
    result = message_service.start_conversation(db, payload=payload, current_user=current_user)
    if result.message is not None:
        notification = notifications_service.notify_message_event(
            db,
            message=result.message,
            sender=current_user,
        )
        await message_websocket_service.publish_message_created(result.message)
        if notification is not None:
            await message_websocket_service.publish_notification_created(
                notification.user_id,
                NotificationResponse.model_validate(notification),
            )
    return result


@router.get("/requests", response_model=ConversationListResponse)
def list_requests(db: DbSession, current_user: CurrentUser) -> ConversationListResponse:
    return message_service.list_incoming_requests(db, current_user)


@router.get("/pending", response_model=ConversationListResponse)
def list_pending(db: DbSession, current_user: CurrentUser) -> ConversationListResponse:
    return message_service.list_outgoing_pending(db, current_user)


@router.get("/conversations/{conversation_id}", response_model=MessageListResponse)
def get_conversation_messages(
    conversation_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    limit: LimitQuery = 50,
    offset: OffsetQuery = 0,
) -> MessageListResponse:
    return message_service.list_messages(
        db,
        connection_id=conversation_id,
        current_user=current_user,
        limit=limit,
        offset=offset,
    )


@router.patch("/conversations/{conversation_id}/read", response_model=MarkReadResponse)
def mark_conversation_read(
    conversation_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> MarkReadResponse:
    return message_service.mark_read(db, connection_id=conversation_id, current_user=current_user)


@router.post("/requests/{conversation_id}/accept", response_model=RequestActionResponse)
def accept_request(
    conversation_id: UUID,
    background_tasks: BackgroundTasks,
    db: DbSession,
    current_user: CurrentUser,
) -> RequestActionResponse:
    response = message_service.accept_request(
        db,
        connection_id=conversation_id,
        current_user=current_user,
    )
    notification = notifications_service.notify_connection_accepted(
        db,
        requester_id=response.conversation.participant.id,
        accepter=current_user,
    )
    if notification is not None:
        background_tasks.add_task(
            message_websocket_service.publish_notification_created,
            notification.user_id,
            NotificationResponse.model_validate(notification),
        )
    return response


@router.post("/requests/{conversation_id}/decline", response_model=RequestActionResponse)
def decline_request(
    conversation_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> RequestActionResponse:
    return message_service.decline_request(
        db,
        connection_id=conversation_id,
        current_user=current_user,
    )


@router.websocket("/ws")
async def messages_websocket(websocket: WebSocket) -> None:
    await message_websocket_service.handle_messages_websocket(websocket)
