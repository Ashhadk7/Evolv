from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


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
    phone: Mapped[str | None] = mapped_column(String)
    phone_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    country: Mapped[str | None] = mapped_column(String)
    country_code: Mapped[str | None] = mapped_column(String)
    state_province: Mapped[str | None] = mapped_column(String)
    city: Mapped[str | None] = mapped_column(String)
    dob: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String)
    avatar_url: Mapped[str | None] = mapped_column(String)
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
    profile_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    stripe_connected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped[User] = relationship(back_populates="founder_profile")


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
    rating_avg: Mapped[Decimal] = mapped_column(Numeric, nullable=False, default=0)
    profile_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped[User] = relationship(back_populates="developer_profile")


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
