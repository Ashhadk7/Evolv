from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.blueprint import Blueprint
    from app.models.user import DeveloperProfile, FounderProfile, User


def _pg_enum(enum_type: type[StrEnum], name: str) -> SqlEnum:
    return SqlEnum(
        enum_type,
        name=name,
        native_enum=True,
        values_callable=lambda members: [m.value for m in members],
    )


class ProjectStatus(StrEnum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ProjectMemberStatus(StrEnum):
    INVITED = "invited"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    REVOKED = "revoked"
    REMOVED = "removed"
    COUNTERED = "countered"


class IssuePriority(StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class IssueStatus(StrEnum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"


class DeliverableStatus(StrEnum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"


class DeadlineStatus(StrEnum):
    PENDING = "pending"
    MET = "met"
    MISSED = "missed"


class PaymentStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PaymentProvider(StrEnum):
    MANUAL = "manual"
    STRIPE = "stripe"


project_status_enum = _pg_enum(ProjectStatus, "project_status")
project_member_status_enum = _pg_enum(ProjectMemberStatus, "project_member_status")
issue_priority_enum = _pg_enum(IssuePriority, "project_issue_priority")
issue_status_enum = _pg_enum(IssueStatus, "project_issue_status")
deliverable_status_enum = _pg_enum(DeliverableStatus, "project_deliverable_status")
deadline_status_enum = _pg_enum(DeadlineStatus, "project_deadline_status")
payment_status_enum = _pg_enum(PaymentStatus, "project_payment_status")
payment_provider_enum = _pg_enum(PaymentProvider, "project_payment_provider")

ACTIVE_MEMBER_STATUSES = (
    ProjectMemberStatus.INVITED,
    ProjectMemberStatus.ACCEPTED,
    ProjectMemberStatus.COUNTERED,
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
    members: Mapped[list[ProjectMember]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
    )


class ProjectMember(Base):
    __tablename__ = "project_members"
    __table_args__ = (
        Index("ix_project_members_project_id_phase_index", "project_id", "phase_index"),
        Index("ix_project_members_developer_id_status", "developer_id", "status"),
        Index(
            "uq_project_members_active_engagement",
            "project_id",
            "phase_index",
            "developer_id",
            unique=True,
            postgresql_where=text("status IN ('invited', 'accepted')"),
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    developer_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("developer_profiles.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    phase_index: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[ProjectMemberStatus] = mapped_column(
        project_member_status_enum,
        nullable=False,
        default=ProjectMemberStatus.INVITED,
    )
    amount_agreed_cents: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # The developer's single counter-proposal, cleared once resolved. No
    # back-and-forth thread — status + amount_agreed_cents + this column is
    # the whole state of whatever offer is currently on the table.
    counter_amount_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    invited_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    removed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    removal_reason: Mapped[str | None] = mapped_column(Text)

    project: Mapped[Project] = relationship(back_populates="members")
    developer: Mapped[DeveloperProfile] = relationship(foreign_keys=[developer_id])
    payments: Mapped[list[ProjectPayment]] = relationship(
        back_populates="member",
        cascade="all, delete-orphan",
    )

    @property
    def is_active(self) -> bool:
        return self.status in ACTIVE_MEMBER_STATUSES


class ProjectDeliverable(Base):
    __tablename__ = "project_deliverables"
    __table_args__ = (
        Index("ix_project_deliverables_project_id_phase_index", "project_id", "phase_index"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    phase_index: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    due_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[DeliverableStatus] = mapped_column(
        deliverable_status_enum,
        nullable=False,
        default=DeliverableStatus.TODO,
    )
    completed_by: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    @property
    def done(self) -> bool:
        return self.status == DeliverableStatus.DONE
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    comments: Mapped[list[ProjectComment]] = relationship(
        back_populates="deliverable",
        cascade="all, delete-orphan",
    )
    attachments: Mapped[list[ProjectAttachment]] = relationship(
        back_populates="deliverable",
        cascade="all, delete-orphan",
    )


class ProjectIssue(Base):
    __tablename__ = "project_issues"
    __table_args__ = (
        Index("ix_project_issues_project_id_status", "project_id", "status"),
        Index("ix_project_issues_assignee_id", "assignee_id"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    phase_index: Mapped[int | None] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    priority: Mapped[IssuePriority] = mapped_column(
        issue_priority_enum,
        nullable=False,
        default=IssuePriority.MEDIUM,
    )
    status: Mapped[IssueStatus] = mapped_column(
        issue_status_enum,
        nullable=False,
        default=IssueStatus.OPEN,
    )
    reporter_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
    )
    assignee_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
    )
    due_date: Mapped[date | None] = mapped_column(Date)
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
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    assignee: Mapped[User | None] = relationship(foreign_keys=[assignee_id])
    reporter: Mapped[User | None] = relationship(foreign_keys=[reporter_id])
    comments: Mapped[list[ProjectComment]] = relationship(
        back_populates="issue",
        cascade="all, delete-orphan",
    )
    attachments: Mapped[list[ProjectAttachment]] = relationship(
        back_populates="issue",
        cascade="all, delete-orphan",
    )


class ProjectComment(Base):
    """A comment on either an issue or a deliverable — never both.

    ``ck_project_comments_one_target`` enforces exactly one of ``issue_id`` /
    ``deliverable_id`` at the database level, so a row can never end up
    orphaned or double-attached regardless of what the application layer does.
    """

    __tablename__ = "project_comments"
    __table_args__ = (
        Index("ix_project_comments_issue_id_created_at", "issue_id", "created_at"),
        Index("ix_project_comments_deliverable_id_created_at", "deliverable_id", "created_at"),
        CheckConstraint(
            "(issue_id IS NOT NULL) <> (deliverable_id IS NOT NULL)",
            name="ck_project_comments_one_target",
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    issue_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("project_issues.id", ondelete="CASCADE"),
    )
    deliverable_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("project_deliverables.id", ondelete="CASCADE"),
    )
    author_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    edited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    issue: Mapped[ProjectIssue | None] = relationship(back_populates="comments")
    deliverable: Mapped[ProjectDeliverable | None] = relationship(back_populates="comments")
    author: Mapped[User | None] = relationship(foreign_keys=[author_id])


class ProjectAttachment(Base):
    """A file on either an issue or a deliverable — never both.

    Same one-target invariant as :class:`ProjectComment`, enforced by
    ``ck_project_attachments_one_target``.
    """

    __tablename__ = "project_attachments"
    __table_args__ = (
        Index("ix_project_attachments_issue_id", "issue_id"),
        Index("ix_project_attachments_deliverable_id", "deliverable_id"),
        UniqueConstraint("storage_path", name="uq_project_attachments_storage_path"),
        CheckConstraint(
            "(issue_id IS NOT NULL) <> (deliverable_id IS NOT NULL)",
            name="ck_project_attachments_one_target",
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    issue_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("project_issues.id", ondelete="CASCADE"),
    )
    deliverable_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("project_deliverables.id", ondelete="CASCADE"),
    )
    uploader_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
    )
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    issue: Mapped[ProjectIssue | None] = relationship(back_populates="attachments")
    deliverable: Mapped[ProjectDeliverable | None] = relationship(back_populates="attachments")
    uploader: Mapped[User | None] = relationship(foreign_keys=[uploader_id])


class ProjectDeadline(Base):
    __tablename__ = "project_deadlines"
    __table_args__ = (Index("ix_project_deadlines_project_id_due_date", "project_id", "due_date"),)

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    phase_index: Mapped[int | None] = mapped_column(Integer)
    note: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[IssuePriority] = mapped_column(
        issue_priority_enum,
        nullable=False,
        default=IssuePriority.MEDIUM,
    )
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[DeadlineStatus] = mapped_column(
        deadline_status_enum,
        nullable=False,
        default=DeadlineStatus.PENDING,
    )
    created_by: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    assignees: Mapped[list[ProjectDeadlineAssignee]] = relationship(
        back_populates="deadline",
        cascade="all, delete-orphan",
    )


class ProjectDeadlineAssignee(Base):
    __tablename__ = "project_deadline_assignees"
    __table_args__ = (Index("ix_project_deadline_assignees_user_id", "user_id"),)

    deadline_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("project_deadlines.id", ondelete="CASCADE"),
        primary_key=True,
    )
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    met_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    deadline: Mapped[ProjectDeadline] = relationship(back_populates="assignees")
    user: Mapped[User] = relationship(foreign_keys=[user_id])


class ProjectPayment(Base):
    __tablename__ = "project_payments"
    __table_args__ = (
        Index("ix_project_payments_member_id_created_at", "member_id", "created_at"),
        UniqueConstraint("idempotency_key", name="uq_project_payments_idempotency_key"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    member_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("project_members.id", ondelete="CASCADE"),
        nullable=False,
    )
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    status: Mapped[PaymentStatus] = mapped_column(
        payment_status_enum,
        nullable=False,
        default=PaymentStatus.PENDING,
    )
    provider: Mapped[PaymentProvider] = mapped_column(
        payment_provider_enum,
        nullable=False,
        default=PaymentProvider.MANUAL,
    )
    provider_ref: Mapped[str | None] = mapped_column(String(255))
    idempotency_key: Mapped[str | None] = mapped_column(String(255))
    initiated_by: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
    )
    failure_reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    settled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    member: Mapped[ProjectMember] = relationship(back_populates="payments")
