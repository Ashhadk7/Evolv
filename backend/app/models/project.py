from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Index, String, UniqueConstraint, Uuid, func
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.blueprint import Blueprint
    from app.models.user import DeveloperProfile, FounderProfile


class ProjectStatus(StrEnum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


project_status_enum = SqlEnum(
    ProjectStatus,
    name="project_status",
    native_enum=True,
    values_callable=lambda statuses: [s.value for s in statuses],
)


class Project(Base):
    """A live project that a founder kicks off from one of their blueprints.

    Milestones are stored as a JSONB array so that the schema stays flexible
    while the frontend's ProjectState shape evolves.  Each element is expected
    to follow the structure used by the frontend's ``ProjectPhaseState`` type,
    but the backend treats the column as an opaque document and does not enforce
    an internal schema — validation happens at the API / Pydantic layer.
    """

    __tablename__ = "projects"
    __table_args__ = (
        Index("ix_projects_founder_id_created_at", "founder_id", "created_at"),
        # A blueprint can only ever back one project. This is the actual guard
        # against duplicate creation (retries, out-of-order requests, races
        # between the existence check and the insert) — application-level
        # checks alone cannot be relied upon under concurrency.
        UniqueConstraint("blueprint_id", name="uq_projects_blueprint_id"),
    )

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    blueprint_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("blueprints.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    founder_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("founder_profiles.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Nullable — a project may not yet have an assigned developer.
    developer_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("developer_profiles.user_id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status: Mapped[ProjectStatus] = mapped_column(
        project_status_enum,
        nullable=False,
        default=ProjectStatus.ACTIVE,
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    # Flexible milestone/phase state document — mirrors the frontend's
    # ProjectPhaseState[] shape without enforcing a rigid DB schema.
    milestones: Mapped[list[dict[str, Any]] | None] = mapped_column(
        JSONB,
        nullable=True,
    )
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

    # ── relationships ────────────────────────────────────────────────────────
    blueprint: Mapped[Blueprint] = relationship(foreign_keys=[blueprint_id])
    founder: Mapped[FounderProfile] = relationship(foreign_keys=[founder_id])
    developer: Mapped[DeveloperProfile | None] = relationship(foreign_keys=[developer_id])
