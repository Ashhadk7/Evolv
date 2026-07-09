from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, WebSocket, WebSocketDisconnect, status
from pydantic import ValidationError
from sqlalchemy.orm import Session
from starlette.websockets import WebSocketState

from app.db.session import SessionLocal
from app.models.user import User
from app.repositories import users as users_repository
from app.schemas.messages import MessageResponse, SendMessageRequest
from app.services import messages as message_service
from app.services.exceptions import AuthProviderConfigurationError, InvalidTokenError
from app.services.supabase_auth import SupabaseAuthClient


class MessageWebSocketManager:
    def __init__(self) -> None:
        self._connections: dict[UUID, set[WebSocket]] = {}

    async def connect(self, user_id: UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.setdefault(user_id, set()).add(websocket)

    def disconnect(self, user_id: UUID, websocket: WebSocket) -> None:
        sockets = self._connections.get(user_id)
        if sockets is None:
            return

        sockets.discard(websocket)
        if not sockets:
            del self._connections[user_id]

    async def send_to_user(self, user_id: UUID, payload: dict[str, object]) -> None:
        sockets = self._connections.get(user_id, set()).copy()
        for websocket in sockets:
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.send_json(payload)
            else:
                self.disconnect(user_id, websocket)


message_websocket_manager = MessageWebSocketManager()


async def handle_messages_websocket(websocket: WebSocket) -> None:
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
    websocket: WebSocket, db: Session, current_user: User, payload: object
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
    try:
        message_service.ensure_user_can_use_messaging(app_user)
    except HTTPException:
        return None
    return app_user
