from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, WebSocket

from app.api.deps import CurrentUser, DbSession
from app.schemas.messages import (
    ConversationListResponse,
    MarkReadResponse,
    MessageListResponse,
    RequestActionResponse,
)
from app.services import message_websocket as message_websocket_service
from app.services import messages as message_service

router = APIRouter()

LimitQuery = Annotated[int, Query(ge=1, le=100)]
OffsetQuery = Annotated[int, Query(ge=0)]


@router.get("/conversations", response_model=ConversationListResponse)
def list_conversations(db: DbSession, current_user: CurrentUser) -> ConversationListResponse:
    return message_service.list_conversations(db, current_user)


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
    db: DbSession,
    current_user: CurrentUser,
) -> RequestActionResponse:
    return message_service.accept_request(
        db,
        connection_id=conversation_id,
        current_user=current_user,
    )


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
