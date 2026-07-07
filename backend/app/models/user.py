from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

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


class UserRole(str, Enum):
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
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[UserRole] = mapped_column(user_role_enum, nullable=False)
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    country_code: Mapped[str | None] = mapped_column(String, nullable=True)
    state_province: Mapped[str | None] = mapped_column(String, nullable=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    dob: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
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


class FounderProfile(Base):
    __tablename__ = "founder_profiles"

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    headline: Mapped[str | None] = mapped_column(String, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    linkedin: Mapped[str | None] = mapped_column(String, nullable=True)
    venture_stage: Mapped[str | None] = mapped_column(String, nullable=True)
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
    job_title: Mapped[str | None] = mapped_column(String, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    experience_years: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    availability: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    open_to_remote: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    preferred_budget: Mapped[str | None] = mapped_column(String, nullable=True)
    github: Mapped[str | None] = mapped_column(String, nullable=True)
    linkedin: Mapped[str | None] = mapped_column(String, nullable=True)
    portfolio_link: Mapped[str | None] = mapped_column(String, nullable=True)
    rating_avg: Mapped[Decimal] = mapped_column(Numeric, nullable=False, default=0)
    profile_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped[User] = relationship(back_populates="developer_profile")
