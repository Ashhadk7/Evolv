from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import User


class ConnectionStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"


connection_status_enum = SqlEnum(
    ConnectionStatus,
    name="connection_status",
    native_enum=True,
    values_callable=lambda statuses: [status.value for status in statuses],
)


class MessageConnection(Base):
    __tablename__ = "message_connections"
    __table_args__ = (
        CheckConstraint("requester_id <> addressee_id", name="ck_message_connections_not_self"),
        UniqueConstraint(
            "requester_id",
            "addressee_id",
            name="uq_message_connections_requester_addressee",
        ),
        Index("ix_message_connections_requester_id", "requester_id"),
        Index("ix_message_connections_addressee_id", "addressee_id"),
        Index("ix_message_connections_status", "status"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    requester_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    addressee_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[ConnectionStatus] = mapped_column(
        connection_status_enum,
        nullable=False,
        default=ConnectionStatus.PENDING,
    )
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    declined_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    requester: Mapped[User] = relationship(foreign_keys=[requester_id])
    addressee: Mapped[User] = relationship(foreign_keys=[addressee_id])
    messages: Mapped[list[Message]] = relationship(
        back_populates="connection",
        cascade="all, delete-orphan",
    )


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_connection_id_created_at", "connection_id", "created_at"),
        Index("ix_messages_recipient_id_read_at", "recipient_id", "read_at"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    connection_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("message_connections.id", ondelete="CASCADE"),
        nullable=False,
    )
    sender_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    recipient_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    connection: Mapped[MessageConnection] = relationship(back_populates="messages")
    sender: Mapped[User] = relationship(foreign_keys=[sender_id])
    recipient: Mapped[User] = relationship(foreign_keys=[recipient_id])
