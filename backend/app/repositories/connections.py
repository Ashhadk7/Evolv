from __future__ import annotations

import uuid
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.connection import Connection, ConnectionStatus


def get_connection_by_id(db: Session, connection_id: UUID) -> Connection | None:
    return db.get(Connection, connection_id)


def get_active_connection(db: Session, user_a: UUID, user_b: UUID) -> Connection | None:
    stmt = select(Connection).where(
        or_(
            (Connection.requester_id == user_a) & (Connection.receiver_id == user_b),
            (Connection.requester_id == user_b) & (Connection.receiver_id == user_a),
        )
    )
    return db.scalar(stmt)


def list_incoming_requests(db: Session, user_id: UUID) -> list[Connection]:
    stmt = (
        select(Connection)
        .where((Connection.receiver_id == user_id) & (Connection.status == ConnectionStatus.PENDING))
        .order_by(Connection.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def list_outgoing_requests(db: Session, user_id: UUID) -> list[Connection]:
    stmt = (
        select(Connection)
        .where((Connection.requester_id == user_id) & (Connection.status == ConnectionStatus.PENDING))
        .order_by(Connection.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def list_accepted_connections(db: Session, user_id: UUID) -> list[Connection]:
    stmt = (
        select(Connection)
        .where(
            ((Connection.requester_id == user_id) | (Connection.receiver_id == user_id))
            & (Connection.status == ConnectionStatus.ACCEPTED)
        )
        .order_by(Connection.updated_at.desc())
    )
    return list(db.scalars(stmt).all())


def create_connection(
    db: Session,
    requester_id: UUID,
    receiver_id: UUID,
    note: str | None,
) -> Connection:
    connection = Connection(
        id=uuid.uuid4(),
        requester_id=requester_id,
        receiver_id=receiver_id,
        status=ConnectionStatus.PENDING,
        note=note,
    )
    db.add(connection)
    db.flush()
    return connection


def delete_connection(db: Session, connection: Connection) -> None:
    db.delete(connection)
    db.flush()
