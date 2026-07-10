from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.connection import Connection, ConnectionStatus
from app.repositories import connections as connections_repo
from app.repositories import users as users_repo
from app.schemas.connections import ConnectionCreate, ConnectionUpdate, ConnectionResponse, ConnectionUserSummary
from app.services.exceptions import ConflictError, NotFoundError


def _build_user_summary(user) -> ConnectionUserSummary:
    job_title = None
    company = None

    if user.developer_profile:
        job_title = user.developer_profile.job_title
    elif user.founder_profile:
        job_title = user.founder_profile.headline
        company = user.founder_profile.venture_stage

    raw_role = user.role.value if hasattr(user.role, "value") else str(user.role)
    mapped_role = "Developer" if raw_role == "developer" else "Founder" if raw_role == "founder" else raw_role.capitalize()

    return ConnectionUserSummary(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        avatar_url=user.avatar_url,
        role=mapped_role,
        job_title=job_title,
        company=company,
    )


def _build_connection_response(conn: Connection, other_user) -> ConnectionResponse:
    return ConnectionResponse(
        id=conn.id,
        status=conn.status,
        note=conn.note,
        created_at=conn.created_at,
        updated_at=conn.updated_at,
        user=_build_user_summary(other_user),
    )


def send_connection_request(
    db: Session,
    requester_id: UUID,
    payload: ConnectionCreate,
) -> ConnectionResponse:
    if requester_id == payload.receiver_id:
        raise ConflictError("You cannot connect to yourself.")

    receiver = users_repo.get_user_by_id(db, payload.receiver_id)
    if receiver is None:
        raise NotFoundError("Receiver user not found.")

    existing = connections_repo.get_active_connection(db, requester_id, payload.receiver_id)
    if existing:
        if existing.status == ConnectionStatus.ACCEPTED:
            raise ConflictError("You are already connected to this user.")
        elif existing.status == ConnectionStatus.PENDING:
            raise ConflictError("A connection request is already pending between you two.")
        else:
            connections_repo.delete_connection(db, existing)

    conn = connections_repo.create_connection(
        db,
        requester_id=requester_id,
        receiver_id=payload.receiver_id,
        note=payload.note,
    )
    return _build_connection_response(conn, receiver)


def update_connection_status(
    db: Session,
    user_id: UUID,
    connection_id: UUID,
    payload: ConnectionUpdate,
) -> ConnectionResponse:
    connection = connections_repo.get_connection_by_id(db, connection_id)
    if connection is None:
        raise NotFoundError("Connection request not found.")

    if connection.receiver_id != user_id:
        raise ConflictError("Only the recipient can respond to this connection request.")

    if connection.status != ConnectionStatus.PENDING:
        raise ConflictError("This request has already been processed.")

    connection.status = payload.status
    db.flush()
    
    other_user = connection.requester if connection.receiver_id == user_id else connection.receiver
    return _build_connection_response(connection, other_user)


def remove_connection(db: Session, user_id: UUID, connection_id: UUID) -> None:
    connection = connections_repo.get_connection_by_id(db, connection_id)
    if connection is None:
        raise NotFoundError("Connection not found.")

    if connection.requester_id != user_id and connection.receiver_id != user_id:
        raise NotFoundError("Connection not found.")

    connections_repo.delete_connection(db, connection)


def list_my_connections(db: Session, user_id: UUID) -> list[ConnectionResponse]:
    connections = connections_repo.list_accepted_connections(db, user_id)
    results = []
    for conn in connections:
        other_user = conn.receiver if conn.requester_id == user_id else conn.requester
        results.append(_build_connection_response(conn, other_user))
    return results


def list_incoming_requests(db: Session, user_id: UUID) -> list[ConnectionResponse]:
    connections = connections_repo.list_incoming_requests(db, user_id)
    results = []
    for conn in connections:
        results.append(_build_connection_response(conn, conn.requester))
    return results


def list_outgoing_requests(db: Session, user_id: UUID) -> list[ConnectionResponse]:
    connections = connections_repo.list_outgoing_requests(db, user_id)
    results = []
    for conn in connections:
        results.append(_build_connection_response(conn, conn.receiver))
    return results
