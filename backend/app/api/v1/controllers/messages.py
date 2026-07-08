from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, DbSession
from app.db.session import SessionLocal
from app.models.user import User
from app.repositories import users as users_repository
from app.schemas.messages import (
    ConversationListResponse,
    MarkReadResponse,
    MessageListResponse,
    MessageResponse,
    RequestActionResponse,
    SendMessageRequest,
)
from app.services import messages as message_service
from app.services.exceptions import AuthProviderConfigurationError, InvalidTokenError
from app.services.message_websocket import message_websocket_manager
from app.services.supabase_auth import SupabaseAuthClient

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


@router.get("/unread", response_model=ConversationListResponse)
def list_unread(db: DbSession, current_user: CurrentUser) -> ConversationListResponse:
    return message_service.list_unread(db, current_user)


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: SendMessageRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> MessageResponse:
    message = message_service.send_message(db, payload=payload, current_user=current_user)
    await publish_message_created(message)
    return message


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
    token = websocket.query_params.get("token")
    db = SessionLocal()
    current_user = authenticate_websocket_user(db, token)
    if current_user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        db.close()
        return

    await message_websocket_manager.connect(current_user.id, websocket)
    try:
        while True:
            payload = await websocket.receive_json()
            await handle_websocket_message(websocket, db, current_user, payload)
    except WebSocketDisconnect:
        message_websocket_manager.disconnect(current_user.id, websocket)
    finally:
        db.close()


async def handle_websocket_message(
    websocket: WebSocket,
    db: Session,
    current_user: User,
    payload: object,
) -> None:
    try:
        send_payload = SendMessageRequest.model_validate(payload)
        message = message_service.send_message(db, payload=send_payload, current_user=current_user)
    except ValidationError as exc:
        await websocket.send_json({"event": "error", "detail": exc.errors()})
        return
    except HTTPException as exc:
        await websocket.send_json(
            {"event": "error", "detail": exc.detail, "status_code": exc.status_code}
        )
        return

    serialized_message = message.model_dump(mode="json")
    await publish_message_created(message)
    await websocket.send_json({"event": "message.sent", "message": serialized_message})


async def publish_message_created(message: MessageResponse) -> None:
    await message_websocket_manager.send_to_user(
        message.recipient_id,
        {
            "event": "message.created",
            "message": message.model_dump(mode="json"),
        },
    )


def authenticate_websocket_user(db: Session, token: str | None) -> User | None:
    if token is None or not token.strip():
        return None

    try:
        auth_user = SupabaseAuthClient().get_user(token)
    except (AuthProviderConfigurationError, InvalidTokenError):
        return None

    app_user = users_repository.get_user_by_id(db, auth_user.id)
    if app_user is None or not app_user.email_verified:
        return None
    return app_user
