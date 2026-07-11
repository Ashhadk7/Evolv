from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.messaging import ConnectionStatus, Message, MessageConnection
from app.models.user import User, UserRole
from app.repositories import messages as messages_repository
from app.repositories import users as users_repository
from app.repositories import connections as connections_repository
from app.models.connection import ConnectionStatus as NetworkConnectionStatus
from app.schemas.messages import (
    ConversationListResponse,
    ConversationSummary,
    InboxResponse,
    MarkReadResponse,
    MessageListResponse,
    MessageParticipant,
    MessageParticipantLookupResponse,
    MessageResponse,
    RequestActionResponse,
    SendMessageRequest,
)


def list_inbox(db: Session, current_user: User) -> InboxResponse:
    ensure_user_can_use_messaging(current_user)
    conversations = messages_repository.list_conversations_for_user(db, current_user.id)
    requests = messages_repository.list_incoming_requests(db, current_user.id)
    pending = messages_repository.list_outgoing_pending(db, current_user.id)
    return InboxResponse(
        conversations=build_conversation_summaries(db, conversations, current_user),
        requests=build_conversation_summaries(db, requests, current_user),
        pending=build_conversation_summaries(db, pending, current_user),
    )


def find_participant(
    db: Session, *, email: str, current_user: User
) -> MessageParticipantLookupResponse:
    ensure_user_can_use_messaging(current_user)
    participant = users_repository.get_user_by_email(db, email.strip().lower())
    if participant is None or participant.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evolv member not found.")
    return MessageParticipantLookupResponse(participant=build_participant(participant))


def send_message(
    db: Session, *, payload: SendMessageRequest, current_user: User
) -> MessageResponse:
    recipient = users_repository.get_user_by_id(db, payload.recipient_id)
    if recipient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found.")

    ensure_can_start_messaging(current_user, recipient)
    connection = get_or_create_sendable_connection(db, current_user, recipient)

    try:
        message = messages_repository.create_message(
            db,
            connection_id=connection.id,
            sender_id=current_user.id,
            recipient_id=recipient.id,
            body=payload.body,
        )
        connection.updated_at = datetime.now(UTC)
        db.flush()
        db.refresh(message)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Message could not be sent.",
        ) from exc

    return build_message_response(message)


def list_conversations(db: Session, current_user: User) -> ConversationListResponse:
    ensure_user_can_use_messaging(current_user)
    connections = messages_repository.list_conversations_for_user(db, current_user.id)
    return ConversationListResponse(
        items=build_conversation_summaries(db, connections, current_user)
    )


def list_incoming_requests(db: Session, current_user: User) -> ConversationListResponse:
    ensure_user_can_use_messaging(current_user)
    connections = messages_repository.list_incoming_requests(db, current_user.id)
    return ConversationListResponse(
        items=build_conversation_summaries(db, connections, current_user)
    )


def list_outgoing_pending(db: Session, current_user: User) -> ConversationListResponse:
    ensure_user_can_use_messaging(current_user)
    connections = messages_repository.list_outgoing_pending(db, current_user.id)
    return ConversationListResponse(
        items=build_conversation_summaries(db, connections, current_user)
    )


def list_messages(
    db: Session,
    *,
    connection_id: UUID,
    current_user: User,
    limit: int,
    offset: int,
) -> MessageListResponse:
    ensure_user_can_use_messaging(current_user)
    connection = get_participating_connection(db, connection_id, current_user.id)
    messages = messages_repository.list_messages(
        db,
        connection_id=connection.id,
        limit=limit,
        offset=offset,
    )
    return MessageListResponse(
        conversation=build_conversation_summary(db, connection, current_user),
        items=[build_message_response(message) for message in messages],
    )


def mark_read(db: Session, *, connection_id: UUID, current_user: User) -> MarkReadResponse:
    ensure_user_can_use_messaging(current_user)
    connection = get_participating_connection(db, connection_id, current_user.id)

    try:
        marked_read = messages_repository.mark_messages_read(
            db,
            connection_id=connection.id,
            recipient_id=current_user.id,
        )
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Messages could not be marked as read.",
        ) from exc

    return MarkReadResponse(conversation_id=connection.id, marked_read=marked_read)


def accept_request(
    db: Session, *, connection_id: UUID, current_user: User
) -> RequestActionResponse:
    ensure_user_can_use_messaging(current_user)
    connection = get_participating_connection(db, connection_id, current_user.id)
    if connection.addressee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the request recipient can accept this message request.",
        )
    if connection.status != ConnectionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending message requests can be accepted.",
        )

    try:
        messages_repository.accept_connection(connection)
        network_connection = connections_repository.get_active_connection(
            db,
            connection.requester_id,
            connection.addressee_id,
        )
        if network_connection is None:
            network_connection = connections_repository.create_connection(
                db,
                requester_id=connection.requester_id,
                receiver_id=connection.addressee_id,
                note=None,
            )
        network_connection.status = NetworkConnectionStatus.ACCEPTED
        db.commit()
        db.refresh(connection)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Message request could not be accepted.",
        ) from exc

    return RequestActionResponse(
        conversation=build_conversation_summary(db, connection, current_user),
        message="Message request accepted.",
    )


def decline_request(
    db: Session, *, connection_id: UUID, current_user: User
) -> RequestActionResponse:
    ensure_user_can_use_messaging(current_user)
    connection = get_participating_connection(db, connection_id, current_user.id)
    if connection.addressee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the request recipient can decline this message request.",
        )
    if connection.status != ConnectionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending message requests can be declined.",
        )

    try:
        messages_repository.decline_connection(connection)
        db.commit()
        db.refresh(connection)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Message request could not be declined.",
        ) from exc

    return RequestActionResponse(
        conversation=build_conversation_summary(db, connection, current_user),
        message="Message request declined.",
    )


def get_or_create_sendable_connection(
    db: Session, current_user: User, recipient: User
) -> MessageConnection:
    connection = messages_repository.get_connection_between(db, current_user.id, recipient.id)
    if connection is None:
        connection = messages_repository.create_connection(
            db,
            requester_id=current_user.id,
            addressee_id=recipient.id,
        )
        db.flush()
        return connection

    if connection.status == ConnectionStatus.ACCEPTED:
        return connection

    if connection.status == ConnectionStatus.DECLINED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This message request was declined.",
        )

    if connection.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accept the message request before replying.",
        )

    sent_count = messages_repository.count_pending_messages_by_sender(
        db,
        connection_id=connection.id,
        sender_id=current_user.id,
    )
    if sent_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Wait for this message request to be accepted before sending another message.",
        )

    return connection


def get_participating_connection(
    db: Session, connection_id: UUID, user_id: UUID
) -> MessageConnection:
    connection = messages_repository.get_connection_by_id(db, connection_id)
    if connection is None or user_id not in {connection.requester_id, connection.addressee_id}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    return connection


def ensure_can_start_messaging(current_user: User, recipient: User) -> None:
    if current_user.id == recipient.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot message yourself.",
        )

    ensure_user_can_use_messaging(current_user)
    ensure_user_can_use_messaging(recipient, subject="Recipient")


def ensure_user_can_use_messaging(user: User, *, subject: str = "User") -> None:
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{subject} email must be verified before messaging.",
        )
    if not user.phone_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{subject} phone number must be verified before messaging.",
        )
    profile = get_profile_for_user(user)
    if profile is None or not bool(getattr(profile, "profile_complete", False)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{subject} profile must be complete before messaging.",
        )


def build_conversation_summary(
    db: Session, connection: MessageConnection, current_user: User
) -> ConversationSummary:
    if connection.requester_id == current_user.id:
        participant = connection.addressee
    else:
        participant = connection.requester
    last_message = messages_repository.get_last_message(db, connection.id)
    return ConversationSummary(
        id=connection.id,
        status=connection.status,
        participant=build_participant(participant),
        last_message=build_message_response(last_message) if last_message is not None else None,
        unread_count=messages_repository.count_unread_messages(
            db,
            connection_id=connection.id,
            recipient_id=current_user.id,
        ),
        created_at=connection.created_at,
        updated_at=connection.updated_at,
    )


def build_conversation_summaries(
    db: Session, connections: list[MessageConnection], current_user: User
) -> list[ConversationSummary]:
    return [
        build_conversation_summary(db, connection, current_user)
        for connection in connections
    ]


def build_participant(user: User) -> MessageParticipant:
    profile = get_profile_for_user(user)
    return MessageParticipant(
        id=user.id,
        role=user.role.value,
        first_name=user.first_name,
        last_name=user.last_name,
        avatar_url=user.avatar_url,
        profile_title=get_profile_title(user),
        profile_complete=bool(getattr(profile, "profile_complete", False)),
        phone_verified=user.phone_verified,
    )


def build_message_response(message: Message) -> MessageResponse:
    return MessageResponse(
        id=message.id,
        conversation_id=message.connection_id,
        sender_id=message.sender_id,
        recipient_id=message.recipient_id,
        body=message.body,
        read_at=message.read_at,
        created_at=message.created_at,
    )


def get_profile_for_user(user: User) -> object | None:
    if user.role == UserRole.FOUNDER:
        return user.founder_profile
    return user.developer_profile


def get_profile_title(user: User) -> str | None:
    if user.role == UserRole.FOUNDER and user.founder_profile is not None:
        return user.founder_profile.headline
    if user.role == UserRole.DEVELOPER and user.developer_profile is not None:
        return user.developer_profile.job_title
    return None
