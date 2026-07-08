from __future__ import annotations

from uuid import UUID

from fastapi import WebSocket
from starlette.websockets import WebSocketState


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
