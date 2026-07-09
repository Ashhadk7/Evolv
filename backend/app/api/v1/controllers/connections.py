from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.connections import (
    ConnectionCreate,
    ConnectionResponse,
    ConnectionUpdate,
)
from app.services import connections_service
from app.services.exceptions import ConflictError, NotFoundError

router = APIRouter()


@router.get("", response_model=list[ConnectionResponse])
def list_my_connections(
    db: DbSession,
    current_user: CurrentUser,
) -> list[ConnectionResponse]:
    items = connections_service.list_my_connections(db, current_user.id)
    return [ConnectionResponse.model_validate(item) for item in items]


@router.get("/incoming", response_model=list[ConnectionResponse])
def list_incoming_requests(
    db: DbSession,
    current_user: CurrentUser,
) -> list[ConnectionResponse]:
    items = connections_service.list_incoming_requests(db, current_user.id)
    return [ConnectionResponse.model_validate(item) for item in items]


@router.get("/outgoing", response_model=list[ConnectionResponse])
def list_outgoing_requests(
    db: DbSession,
    current_user: CurrentUser,
) -> list[ConnectionResponse]:
    items = connections_service.list_outgoing_requests(db, current_user.id)
    return [ConnectionResponse.model_validate(item) for item in items]


@router.post("", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
def send_connection_request(
    payload: ConnectionCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> ConnectionResponse:
    try:
        conn = connections_service.send_connection_request(db, current_user.id, payload)
        db.commit()
        db.refresh(conn)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    outgoing = connections_service.list_outgoing_requests(db, current_user.id)
    for item in outgoing:
        if item["id"] == conn.id:
            return ConnectionResponse.model_validate(item)
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve connection detail.")


@router.patch("/{connection_id}", response_model=ConnectionResponse)
def respond_to_connection_request(
    connection_id: UUID,
    payload: ConnectionUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> ConnectionResponse:
    try:
        conn = connections_service.update_connection_status(db, current_user.id, connection_id, payload)
        db.commit()
        db.refresh(conn)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    if conn.status == "accepted":
        connections = connections_service.list_my_connections(db, current_user.id)
        for item in connections:
            if item["id"] == conn.id:
                return ConnectionResponse.model_validate(item)
    else:
        incoming = connections_service.list_incoming_requests(db, current_user.id)
        for item in incoming:
            if item["id"] == conn.id:
                return ConnectionResponse.model_validate(item)

    from app.services.connections_service import _build_user_summary
    other_user = conn.requester if conn.receiver_id == current_user.id else conn.receiver
    return ConnectionResponse.model_validate({
        "id": conn.id,
        "status": conn.status,
        "note": conn.note,
        "created_at": conn.created_at,
        "updated_at": conn.updated_at,
        "user": _build_user_summary(other_user),
    })


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_connection(
    connection_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    try:
        connections_service.remove_connection(db, current_user.id, connection_id)
        db.commit()
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
