from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import FounderProfile


class BlueprintVisibility(str, Enum):
    PRIVATE = "private"
    PUBLIC = "public"


class VersionState(str, Enum):
    CURRENT = "current"
    PENDING = "pending"


class LevelRating(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


blueprint_visibility_enum = SqlEnum(
    BlueprintVisibility,
    name="blueprint_visibility",
    native_enum=True,
    values_callable=lambda visibilities: [visibility.value for visibility in visibilities],
)

version_state_enum = SqlEnum(
    VersionState,
    name="version_state",
    native_enum=True,
    values_callable=lambda states: [state.value for state in states],
)

level_rating_enum = SqlEnum(
    LevelRating,
    name="level_rating",
    native_enum=True,
    values_callable=lambda ratings: [rating.value for rating in ratings],
)


class Blueprint(Base):
    __tablename__ = "blueprints"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    founder_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("founder_profiles.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    visibility: Mapped[BlueprintVisibility] = mapped_column(
        blueprint_visibility_enum,
        nullable=False,
        default=BlueprintVisibility.PRIVATE,
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

    founder_profile: Mapped[FounderProfile] = relationship(back_populates="blueprints")
    versions: Mapped[list[BlueprintVersion]] = relationship(
        back_populates="blueprint",
        cascade="all, delete-orphan",
    )

    @property
    def current_version(self) -> BlueprintVersion | None:
        return next((v for v in self.versions if v.state == VersionState.CURRENT), None)


class BlueprintVersion(Base):
    __tablename__ = "blueprint_versions"
    __table_args__ = (
        UniqueConstraint(
            "blueprint_id", "state", name="blueprint_versions_blueprint_id_state_key"
        ),
        CheckConstraint(
            "viability >= 0 AND viability <= 100",
            name="blueprint_versions_viability_check",
        ),
        CheckConstraint(
            "market_potential >= 0 AND market_potential <= 100",
            name="blueprint_versions_market_potential_check",
        ),
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
    state: Mapped[VersionState] = mapped_column(version_state_enum, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    industry: Mapped[str] = mapped_column(String, nullable=False)
    idea_desc: Mapped[str] = mapped_column(Text, nullable=False)
    differentiator: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_recommend: Mapped[str | None] = mapped_column(Text, nullable=True)
    viability: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    market_potential: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    developer_demand: Mapped[LevelRating] = mapped_column(level_rating_enum, nullable=False)
    content_json: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    content_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    blueprint: Mapped[Blueprint] = relationship(back_populates="versions")
