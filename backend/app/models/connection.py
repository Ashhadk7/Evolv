from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

if TYPE_CHECKING:
    from app.models.user import User

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, Uuid, func
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ConnectionStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    IGNORED = "ignored"
    REJECTED = "rejected"


connection_status_enum = SqlEnum(
    ConnectionStatus,
    name="network_connection_status",
    native_enum=True,
    values_callable=lambda statuses: [s.value for s in statuses],
)


class Connection(Base):
    __tablename__ = "network_connections"
    __table_args__ = (
        UniqueConstraint("requester_id", "receiver_id", name="uq_requester_receiver"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    requester_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    receiver_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[ConnectionStatus] = mapped_column(connection_status_enum, nullable=False)
    note: Mapped[str | None] = mapped_column(String(500), nullable=True)

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

    requester: Mapped[User] = relationship(
        "User",
        foreign_keys=[requester_id],
        back_populates="sent_connections",
    )
    receiver: Mapped[User] = relationship(
        "User",
        foreign_keys=[receiver_id],
        back_populates="received_connections",
    )
