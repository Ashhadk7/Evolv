from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from app.models.connection import Connection
    from app.models.certification import Certification
    from app.models.developer_review import DeveloperReview
    from app.models.google_calendar import GoogleCalendarCredential

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    JSON,
    SmallInteger,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.application import Application, SavedBlueprint
    from app.models.blueprint import Blueprint


class UserRole(StrEnum):
    FOUNDER = "founder"
    DEVELOPER = "developer"


user_role_enum = SqlEnum(
    UserRole,
    name="user_role",
    native_enum=True,
    values_callable=lambda roles: [role.value for role in roles],
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    role: Mapped[UserRole] = mapped_column(user_role_enum, nullable=False)
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    email_otp_hash: Mapped[str | None] = mapped_column(String)
    email_otp_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    password_reset_otp_hash: Mapped[str | None] = mapped_column(String)
    password_reset_otp_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    phone: Mapped[str] = mapped_column(String)
    phone_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    country: Mapped[str] = mapped_column(String)
    country_code: Mapped[str] = mapped_column(String)
    state_province: Mapped[str] = mapped_column(String)
    city: Mapped[str] = mapped_column(String)
    dob: Mapped[date] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String)
    avatar_url: Mapped[str | None] = mapped_column(String)
    notification_preferences: Mapped[dict[str, bool]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )
    terms_accepted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
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

    founder_profile: Mapped[FounderProfile | None] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    developer_profile: Mapped[DeveloperProfile | None] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    educations: Mapped[list[Education]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    sent_connections: Mapped[list[Connection]] = relationship(
        "Connection",
        foreign_keys="[Connection.requester_id]",
        back_populates="requester",
        cascade="all, delete-orphan",
    )
    received_connections: Mapped[list[Connection]] = relationship(
        "Connection",
        foreign_keys="[Connection.receiver_id]",
        back_populates="receiver",
        cascade="all, delete-orphan",
    )
    certifications: Mapped[list[Certification]] = relationship(
        "Certification",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    google_calendar_credential: Mapped[GoogleCalendarCredential | None] = relationship(
        "GoogleCalendarCredential",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    @property
    def profile_title(self) -> str | None:
        if self.role == UserRole.FOUNDER:
            return self.founder_profile.headline if self.founder_profile else None
        return self.developer_profile.job_title if self.developer_profile else None

    @property
    def profile_bio(self) -> str | None:
        profile = self.founder_profile if self.role == UserRole.FOUNDER else self.developer_profile
        return profile.bio if profile else None

    @property
    def profile_complete(self) -> bool:
        profile = self.founder_profile if self.role == UserRole.FOUNDER else self.developer_profile
        return bool(self.phone_verified and profile and profile.profile_complete)

    @property
    def rating_avg(self) -> float | None:
        if self.role == UserRole.DEVELOPER and self.developer_profile is not None:
            return float(self.developer_profile.rating_avg or 0)
        return None

    @property
    def discovery_tags(self) -> list[str]:
        if self.role == UserRole.FOUNDER:
            return self.founder_profile.domains if self.founder_profile else []
        return self.developer_profile.skills if self.developer_profile else []


class FounderProfile(Base):
    __tablename__ = "founder_profiles"

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    headline: Mapped[str | None] = mapped_column(String)
    bio: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    linkedin: Mapped[str | None] = mapped_column(String)
    venture_stage: Mapped[str | None] = mapped_column(String)
    primary_goal: Mapped[str] = mapped_column(String, nullable=False, default="not_selected")
    domains: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    profile_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    stripe_connected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped[User] = relationship(back_populates="founder_profile")
    blueprints: Mapped[list[Blueprint]] = relationship(
        back_populates="founder_profile",
        cascade="all, delete-orphan",
    )


class DeveloperProfile(Base):
    __tablename__ = "developer_profiles"

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    job_title: Mapped[str | None] = mapped_column(String)
    bio: Mapped[str | None] = mapped_column(Text)
    experience_years: Mapped[int | None] = mapped_column(SmallInteger)
    availability: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    open_to_remote: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    preferred_budget: Mapped[str | None] = mapped_column(String)
    github: Mapped[str | None] = mapped_column(String)
    linkedin: Mapped[str | None] = mapped_column(String)
    portfolio_link: Mapped[str | None] = mapped_column(String)
    skills: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    rating_avg: Mapped[Decimal] = mapped_column(Numeric, nullable=False, default=0)
    profile_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped[User] = relationship(back_populates="developer_profile")
    reviews: Mapped[list[DeveloperReview]] = relationship(
        "DeveloperReview",
        back_populates="developer",
        cascade="all, delete-orphan",
    )

    @property
    def first_name(self) -> str | None:
        return self.user.first_name if self.user else None

    @property
    def last_name(self) -> str | None:
        return self.user.last_name if self.user else None

    @property
    def full_name(self) -> str:
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip()
        return "Developer"
    applications: Mapped[list[Application]] = relationship(
        back_populates="developer",
        cascade="all, delete-orphan",
    )
    saved_blueprints: Mapped[list[SavedBlueprint]] = relationship(
        back_populates="developer",
        cascade="all, delete-orphan",
    )


class Education(Base):
    __tablename__ = "educations"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    level: Mapped[str] = mapped_column(String, nullable=False)
    degree: Mapped[str | None] = mapped_column(String)
    custom_degree: Mapped[str | None] = mapped_column(String)
    school: Mapped[str] = mapped_column(String, nullable=False)

    user: Mapped[User] = relationship(back_populates="educations")
