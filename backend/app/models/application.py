from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Uuid, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.blueprint import Blueprint
    from app.models.user import DeveloperProfile


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint(
            "developer_id", "blueprint_id", name="applications_developer_id_blueprint_id_key"
        ),
        CheckConstraint(
            "status in ('applied', 'withdrawn')",
            name="ck_applications_status",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    developer_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("developer_profiles.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    blueprint_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("blueprints.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    connection_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="applied")
    applied_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    withdrawn_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    developer: Mapped[DeveloperProfile] = relationship(back_populates="applications")
    blueprint: Mapped[Blueprint] = relationship()


class SavedBlueprint(Base):
    __tablename__ = "saved_blueprints"

    developer_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("developer_profiles.user_id", ondelete="CASCADE"),
        primary_key=True,
    )
    blueprint_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("blueprints.id", ondelete="CASCADE"),
        primary_key=True,
    )
    saved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    developer: Mapped[DeveloperProfile] = relationship(back_populates="saved_blueprints")
    blueprint: Mapped[Blueprint] = relationship()
