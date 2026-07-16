from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.connection import Connection, ConnectionStatus
from app.models.messaging import ConnectionStatus as MessageConnectionStatus
from app.repositories import connections as connections_repo
from app.repositories import messages as messages_repo
from app.repositories import users as users_repo
from app.schemas.connections import ConnectionCreate, ConnectionUpdate
from app.services.exceptions import ConflictError, NotFoundError


def _build_user_summary(user) -> dict:
    job_title = None
    company = None

    if user.developer_profile:
        job_title = user.developer_profile.job_title
    elif user.founder_profile:
        job_title = user.founder_profile.headline
        company = user.founder_profile.venture_stage

    raw_role = user.role.value if hasattr(user.role, "value") else str(user.role)
    mapped_role = (
        "Developer"
        if raw_role == "developer"
        else "Founder"
        if raw_role == "founder"
        else raw_role.capitalize()
    )

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "avatar_url": user.avatar_url,
        "role": mapped_role,
        "job_title": job_title,
        "company": company,
    }


def send_connection_request(
    db: Session,
    requester_id: UUID,
    payload: ConnectionCreate,
) -> Connection:
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
            raise ConflictError("This connection request was declined.")

    return connections_repo.create_connection(
        db,
        requester_id=requester_id,
        receiver_id=payload.receiver_id,
        note=payload.note,
    )


def update_connection_status(
    db: Session,
    user_id: UUID,
    connection_id: UUID,
    payload: ConnectionUpdate,
) -> Connection:
    connection = connections_repo.get_connection_by_id(db, connection_id)
    if connection is None:
        raise NotFoundError("Connection request not found.")

    if connection.receiver_id != user_id:
        raise ConflictError("Only the recipient can respond to this connection request.")

    if connection.status != ConnectionStatus.PENDING:
        raise ConflictError("This request has already been processed.")

    connection.status = payload.status
    sync_message_connection_status(db, connection, payload.status)
    db.flush()
    return connection


def sync_message_connection_status(
    db: Session,
    connection: Connection,
    status: ConnectionStatus,
) -> None:
    message_connection = messages_repo.get_connection_between(
        db,
        connection.requester_id,
        connection.receiver_id,
    )
    if status == ConnectionStatus.ACCEPTED:
        if message_connection is None:
            message_connection = messages_repo.create_connection(
                db,
                requester_id=connection.requester_id,
                addressee_id=connection.receiver_id,
            )
        messages_repo.accept_connection(message_connection)
        return

    if (
        status in {ConnectionStatus.IGNORED, ConnectionStatus.REJECTED}
        and message_connection is not None
        and message_connection.status == MessageConnectionStatus.PENDING
    ):
        messages_repo.decline_connection(message_connection)


def remove_connection(db: Session, user_id: UUID, connection_id: UUID) -> None:
    connection = connections_repo.get_connection_by_id(db, connection_id)
    if connection is None:
        raise NotFoundError("Connection not found.")

    if connection.requester_id != user_id and connection.receiver_id != user_id:
        raise NotFoundError("Connection not found.")

    connections_repo.delete_connection(db, connection)


def list_my_connections(db: Session, user_id: UUID) -> list[dict]:
    connections = connections_repo.list_accepted_connections(db, user_id)
    results = []
    for conn in connections:
        other_user = conn.receiver if conn.requester_id == user_id else conn.requester
        results.append({
            "id": conn.id,
            "status": conn.status,
            "note": conn.note,
            "created_at": conn.created_at,
            "updated_at": conn.updated_at,
            "user": _build_user_summary(other_user),
        })
    return results


def list_incoming_requests(db: Session, user_id: UUID) -> list[dict]:
    connections = connections_repo.list_incoming_requests(db, user_id)
    results = []
    for conn in connections:
        results.append({
            "id": conn.id,
            "status": conn.status,
            "note": conn.note,
            "created_at": conn.created_at,
            "updated_at": conn.updated_at,
            "user": _build_user_summary(conn.requester),
        })
    return results


def list_outgoing_requests(db: Session, user_id: UUID) -> list[dict]:
    connections = connections_repo.list_outgoing_requests(db, user_id)
    results = []
    for conn in connections:
        results.append({
            "id": conn.id,
            "status": conn.status,
            "note": conn.note,
            "created_at": conn.created_at,
            "updated_at": conn.updated_at,
            "user": _build_user_summary(conn.receiver),
        })
    return results
