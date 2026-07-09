from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.models.messaging import ConnectionStatus, Message, MessageConnection


def get_connection_by_id(db: Session, connection_id: UUID) -> MessageConnection | None:
    return db.get(MessageConnection, connection_id)


def get_connection_between(
    db: Session,
    first_user_id: UUID,
    second_user_id: UUID,
) -> MessageConnection | None:
    return db.scalar(
        select(MessageConnection).where(
            or_(
                and_(
                    MessageConnection.requester_id == first_user_id,
                    MessageConnection.addressee_id == second_user_id,
                ),
                and_(
                    MessageConnection.requester_id == second_user_id,
                    MessageConnection.addressee_id == first_user_id,
                ),
            )
        )
    )


def create_connection(
    db: Session,
    *,
    requester_id: UUID,
    addressee_id: UUID,
) -> MessageConnection:
    connection = MessageConnection(
        requester_id=requester_id,
        addressee_id=addressee_id,
        status=ConnectionStatus.PENDING,
    )
    db.add(connection)
    return connection


def accept_connection(connection: MessageConnection) -> MessageConnection:
    connection.status = ConnectionStatus.ACCEPTED
    connection.accepted_at = datetime.now(UTC)
    connection.declined_at = None
    return connection


def decline_connection(connection: MessageConnection) -> MessageConnection:
    connection.status = ConnectionStatus.DECLINED
    connection.declined_at = datetime.now(UTC)
    return connection


def create_message(
    db: Session,
    *,
    connection_id: UUID,
    sender_id: UUID,
    recipient_id: UUID,
    body: str,
) -> Message:
    message = Message(
        connection_id=connection_id,
        sender_id=sender_id,
        recipient_id=recipient_id,
        body=body,
    )
    db.add(message)
    return message


def count_pending_messages_by_sender(
    db: Session,
    *,
    connection_id: UUID,
    sender_id: UUID,
) -> int:
    return (
        db.scalar(
            select(func.count())
            .select_from(Message)
            .where(Message.connection_id == connection_id, Message.sender_id == sender_id)
        )
        or 0
    )


def list_conversations_for_user(db: Session, user_id: UUID) -> list[MessageConnection]:
    return list(
        db.scalars(
            select(MessageConnection)
            .where(
                MessageConnection.status == ConnectionStatus.ACCEPTED,
                or_(
                    MessageConnection.requester_id == user_id,
                    MessageConnection.addressee_id == user_id,
                ),
            )
            .order_by(MessageConnection.updated_at.desc())
        ).all()
    )


def list_incoming_requests(db: Session, user_id: UUID) -> list[MessageConnection]:
    return list(
        db.scalars(
            select(MessageConnection)
            .where(
                MessageConnection.status == ConnectionStatus.PENDING,
                MessageConnection.addressee_id == user_id,
            )
            .order_by(MessageConnection.created_at.desc())
        ).all()
    )


def list_outgoing_pending(db: Session, user_id: UUID) -> list[MessageConnection]:
    return list(
        db.scalars(
            select(MessageConnection)
            .where(
                MessageConnection.status == ConnectionStatus.PENDING,
                MessageConnection.requester_id == user_id,
            )
            .order_by(MessageConnection.created_at.desc())
        ).all()
    )


def list_messages(
    db: Session,
    *,
    connection_id: UUID,
    limit: int,
    offset: int,
) -> list[Message]:
    return list(
        db.scalars(
            select(Message)
            .where(Message.connection_id == connection_id)
            .order_by(Message.created_at.asc())
            .offset(offset)
            .limit(limit)
        ).all()
    )


def get_last_message(db: Session, connection_id: UUID) -> Message | None:
    return db.scalar(
        select(Message)
        .where(Message.connection_id == connection_id)
        .order_by(Message.created_at.desc())
        .limit(1)
    )


def count_unread_messages(db: Session, *, connection_id: UUID, recipient_id: UUID) -> int:
    return (
        db.scalar(
            select(func.count())
            .select_from(Message)
            .where(
                Message.connection_id == connection_id,
                Message.recipient_id == recipient_id,
                Message.read_at.is_(None),
            )
        )
        or 0
    )


def mark_messages_read(db: Session, *, connection_id: UUID, recipient_id: UUID) -> int:
    unread_messages = list(
        db.scalars(
            select(Message).where(
                Message.connection_id == connection_id,
                Message.recipient_id == recipient_id,
                Message.read_at.is_(None),
            )
        ).all()
    )
    read_at = datetime.now(UTC)
    for message in unread_messages:
        message.read_at = read_at
    return len(unread_messages)
