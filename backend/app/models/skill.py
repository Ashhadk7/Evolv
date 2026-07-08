from __future__ import annotations

from enum import Enum
from uuid import UUID

from sqlalchemy import ForeignKey, SmallInteger, String, UniqueConstraint, Uuid
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SkillKind(str, Enum):
    SKILL = "Skill"
    TECH_STACK = "Tech stack"
    FRAMEWORK = "Framework"
    TOOL = "Tool"


class SkillExperience(str, Enum):
    LEARNING = "Learning"
    LESS_THAN_1 = "< 1 year"
    ONE_TO_TWO = "1-2 years"
    THREE_TO_FIVE = "3-5 years"
    FIVE_PLUS = "5+ years"


skill_kind_enum = SqlEnum(
    SkillKind,
    name="skill_kind",
    native_enum=True,
    values_callable=lambda kinds: [k.value for k in kinds],
)

skill_experience_enum = SqlEnum(
    SkillExperience,
    name="skill_experience",
    native_enum=True,
    values_callable=lambda exps: [e.value for e in exps],
)


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)

    user_skills: Mapped[list[UserSkill]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
    )


class UserSkill(Base):
    __tablename__ = "user_skills"
    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", "kind", name="uq_user_skill_kind"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    skill_id: Mapped[int] = mapped_column(
        SmallInteger,
        ForeignKey("skills.id"),
        nullable=False,
    )
    kind: Mapped[SkillKind] = mapped_column(skill_kind_enum, nullable=False)
    experience_level: Mapped[SkillExperience] = mapped_column(skill_experience_enum, nullable=False)

    skill: Mapped[Skill] = relationship(back_populates="user_skills")


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)

    developer_tags: Mapped[list[DeveloperTag]] = relationship(
        back_populates="tag",
        cascade="all, delete-orphan",
    )


class DeveloperTag(Base):
    __tablename__ = "developer_tags"

    developer_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("developer_profiles.user_id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[int] = mapped_column(
        SmallInteger,
        ForeignKey("tags.id"),
        primary_key=True,
    )

    tag: Mapped[Tag] = relationship(back_populates="developer_tags")


class Domain(Base):
    __tablename__ = "domains"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)

    founder_domains: Mapped[list[FounderDomain]] = relationship(
        back_populates="domain",
        cascade="all, delete-orphan",
    )


class FounderDomain(Base):
    __tablename__ = "founder_domains"

    founder_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("founder_profiles.user_id", ondelete="CASCADE"),
        primary_key=True,
    )
    domain_id: Mapped[int] = mapped_column(
        SmallInteger,
        ForeignKey("domains.id"),
        primary_key=True,
    )

    domain: Mapped[Domain] = relationship(back_populates="founder_domains")
