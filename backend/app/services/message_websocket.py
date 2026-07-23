from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, WebSocket, WebSocketDisconnect, status
from pydantic import ValidationError
from starlette.websockets import WebSocketState

from app.db.session import SessionLocal
from app.repositories import users as users_repository
from app.schemas.messages import MessageResponse, SendMessageRequest
from app.schemas.notifications import NotificationResponse
from app.services import notifications_service
from app.services import messages as message_service
from app.services.exceptions import (
    AuthProviderConfigurationError,
    AuthServiceUnavailableError,
    InvalidTokenError,
)
from app.services.supabase_auth import SupabaseAuthClient


class MessageWebSocketManager:
    def __init__(self) -> None:
        self._connections: dict[UUID, set[WebSocket]] = {}

    async def connect(self, user_id: UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.setdefault(user_id, set()).add(websocket)
        await websocket.send_json(
            {
                "event": "presence.snapshot",
                "online_user_ids": [str(item) for item in self.online_user_ids],
            }
        )
        await self.broadcast_presence(user_id, True, exclude=websocket)

    def disconnect(self, user_id: UUID, websocket: WebSocket) -> None:
        sockets = self._connections.get(user_id)
        if sockets is None:
            return

        sockets.discard(websocket)
        if not sockets:
            del self._connections[user_id]

    @property
    def online_user_ids(self) -> list[UUID]:
        return list(self._connections)

    async def broadcast_presence(
        self,
        user_id: UUID,
        online: bool,
        *,
        exclude: WebSocket | None = None,
    ) -> None:
        payload = {"event": "presence.changed", "user_id": str(user_id), "online": online}
        for connected_user_id, sockets in list(self._connections.items()):
            for socket in sockets.copy():
                if socket is exclude:
                    continue
                if socket.client_state != WebSocketState.CONNECTED:
                    self.disconnect(connected_user_id, socket)
                    continue
                try:
                    await socket.send_json(payload)
                except (RuntimeError, WebSocketDisconnect):
                    self.disconnect(connected_user_id, socket)

    async def send_to_user(self, user_id: UUID, payload: dict[str, object]) -> None:
        sockets = self._connections.get(user_id, set()).copy()
        for websocket in sockets:
            if websocket.client_state != WebSocketState.CONNECTED:
                self.disconnect(user_id, websocket)
                continue
            try:
                await websocket.send_json(payload)
            except (RuntimeError, WebSocketDisconnect):
                self.disconnect(user_id, websocket)


message_websocket_manager = MessageWebSocketManager()


async def handle_messages_websocket(websocket: WebSocket) -> None:
    token = websocket.query_params.get("token")
    current_user_id = authenticate_websocket_user(token)
    if current_user_id is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await message_websocket_manager.connect(current_user_id, websocket)
    try:
        while True:
            payload = await websocket.receive_json()
            await handle_websocket_message(websocket, current_user_id, payload)
    except WebSocketDisconnect:
        pass
    finally:
        message_websocket_manager.disconnect(current_user_id, websocket)
        if current_user_id not in message_websocket_manager.online_user_ids:
            await message_websocket_manager.broadcast_presence(current_user_id, False)


async def handle_websocket_message(
    websocket: WebSocket, current_user_id: UUID, payload: object
) -> None:
    try:
        send_payload = SendMessageRequest.model_validate(payload)
    except ValidationError as exc:
        await websocket.send_json({"event": "error", "detail": exc.errors()})
        return

    try:
        with SessionLocal() as db:
            current_user = users_repository.get_user_by_id(db, current_user_id)
            if current_user is None or not current_user.email_verified:
                await websocket.send_json(
                    {
                        "event": "error",
                        "detail": "Authenticated user is not registered in the application.",
                        "status_code": status.HTTP_401_UNAUTHORIZED,
                    }
                )
                return

            message = message_service.send_message(
                db, payload=send_payload, current_user=current_user
            )
            serialized_message = message.model_dump(mode="json")
            notification = notifications_service.notify_message_event(
                db,
                message=message,
                sender=current_user,
            )
            notification_response = (
                NotificationResponse.model_validate(notification)
                if notification is not None
                else None
            )
    except HTTPException as exc:
        await websocket.send_json(
            {"event": "error", "detail": exc.detail, "status_code": exc.status_code}
        )
        return

    await publish_message_created(message)
    if notification_response is not None:
        await publish_notification_created(
            notification_response.user_id,
            notification_response,
        )
    await websocket.send_json({"event": "message.sent", "message": serialized_message})


async def publish_message_created(message: MessageResponse) -> None:
    await message_websocket_manager.send_to_user(
        message.recipient_id,
        {
            "event": "message.created",
            "message": message.model_dump(mode="json"),
        },
    )


async def publish_notification_created(
    user_id: UUID,
    notification: NotificationResponse,
) -> None:
    await message_websocket_manager.send_to_user(
        user_id,
        {
            "event": "notification.created",
            "notification": notification.model_dump(mode="json"),
        },
    )


def authenticate_websocket_user(token: str | None) -> UUID | None:
    if token is None or not token.strip():
        return None

    try:
        auth_user = SupabaseAuthClient().get_user(token)
    except (AuthProviderConfigurationError, InvalidTokenError):
        return None
    except AuthServiceUnavailableError:
        # Supabase couldn't be reached right now. The token may well still be
        # valid — this is NOT a rejection of the user's credentials — but we
        # still fail closed on this connection attempt rather than accepting
        # it unverified. The client's normal reconnect logic will retry.
        return None

    with SessionLocal() as db:
        app_user = users_repository.get_user_by_id(db, auth_user.id)
        if app_user is None or not app_user.email_verified:
            return None
    # Presence (online status) is open to any authenticated user. The full
    # messaging gate (phone verified + complete profile) is enforced on *sending*
    # in send_message -> ensure_can_start_messaging, so it isn't repeated here.
    return app_user.id
