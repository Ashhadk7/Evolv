from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.project import (
    DeadlineStatus,
    DeliverableStatus,
    IssuePriority,
    IssueStatus,
    PaymentProvider,
    PaymentStatus,
    ProjectMemberStatus,
    ProjectStatus,
)


class MilestoneItem(BaseModel):
    """A single phase/milestone entry.

    The shape mirrors the frontend's ``ProjectPhaseState`` type so that the
    client can round-trip its local state through the API without transformation.
    The backend stores it as-is inside the ``milestones`` JSONB column.
    """

    model_config = ConfigDict(extra="allow")

    phase: str
    status: str = "Not Started"


class ProjectCreate(BaseModel):
    """Payload to kick off a new project from an existing blueprint."""

    model_config = ConfigDict(extra="forbid")

    blueprint_id: UUID
    title: str = Field(min_length=1, max_length=255)
    milestones: list[dict[str, Any]] | None = None


class ProjectStatusUpdate(BaseModel):
    """Payload to transition a project's lifecycle status."""

    model_config = ConfigDict(extra="forbid")

    status: ProjectStatus


class ProjectMilestonesUpdate(BaseModel):
    """Payload to replace the milestones array in full."""

    model_config = ConfigDict(extra="forbid")

    milestones: list[dict[str, Any]]


class ProjectDeveloperAssign(BaseModel):
    """Payload to assign or unassign a developer from a project.

    Set developer_id to null to unassign.
    """

    model_config = ConfigDict(extra="forbid")

    developer_id: UUID | None = None


# Fields on ProjectResponse that are computed rather than stored on the Project row.
_DERIVED_PROJECT_FIELDS = frozenset({"members", "deliverables_done", "deliverables_total"})


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    blueprint_id: UUID
    founder_id: UUID
    developer_id: UUID | None = None
    status: ProjectStatus
    title: str
    milestones: list[dict[str, Any]] | None = None
    members: list[ProjectMemberResponse] = Field(default_factory=list)
    deliverables_done: int = 0
    deliverables_total: int = 0
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="before")
    @classmethod
    def _project_columns_only(cls, data: Any) -> Any:
        """Read only real columns when validating a Project ORM row.

        `members`, `deliverables_done` and `deliverables_total` are derived, not
        stored: they need a user lookup, a payments sum and a deliverables tally.
        Left alone, `from_attributes` would walk the `Project.members`
        relationship and hand raw ProjectMember rows to ProjectMemberResponse,
        which cannot build the derived fields and raises. Callers assemble these
        three via project_membership_service and apply them with model_copy.
        """
        if isinstance(data, (dict, list)) or not hasattr(data, "members"):
            return data
        return {
            name: getattr(data, name)
            for name in cls.model_fields
            if name not in _DERIVED_PROJECT_FIELDS and hasattr(data, name)
        }


class ProjectListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[ProjectResponse]


class ProjectMemberInvite(BaseModel):
    model_config = ConfigDict(extra="forbid")

    developer_id: UUID
    phase_index: int = Field(ge=0)
    amount_agreed_cents: int = Field(ge=0)


class ProjectMemberRemove(BaseModel):
    model_config = ConfigDict(extra="forbid")

    reason: str = Field(min_length=1, max_length=1000)


class ProjectMemberNegotiate(BaseModel):
    """Developer's counter-offer on a pending invite."""

    model_config = ConfigDict(extra="forbid")

    amount_cents: int = Field(gt=0)


class ProjectMemberCounterRespond(BaseModel):
    """Founder's response to a developer's counter-offer."""

    model_config = ConfigDict(extra="forbid")

    action: Literal["accept", "reject", "negotiate"]
    amount_cents: int | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def _amount_required_for_negotiate(self) -> "ProjectMemberCounterRespond":
        if self.action == "negotiate" and self.amount_cents is None:
            raise ValueError("amount_cents is required when action is 'negotiate'.")
        return self


class ProjectPaymentRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    amount_cents: int = Field(gt=0)
    idempotency_key: str = Field(min_length=8, max_length=255)


class ProjectPaymentCheckoutSessionCreate(ProjectPaymentRecord):
    success_url: str = Field(min_length=1, max_length=2000)
    cancel_url: str = Field(min_length=1, max_length=2000)


class ProjectPaymentCheckoutCancel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    idempotency_key: str = Field(min_length=8, max_length=255)


class ProjectPaymentCheckoutSessionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_id: str
    url: str


class ProjectMemberPaymentResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    amount_cents: int
    currency: str
    status: PaymentStatus
    provider: PaymentProvider
    created_at: datetime
    settled_at: datetime | None = None


class ProjectMemberResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    project_id: UUID
    developer_id: UUID
    developer_name: str
    developer_initials: str
    phase_index: int
    status: ProjectMemberStatus
    amount_agreed_cents: int
    counter_amount_cents: int | None = None
    amount_paid_cents: int = 0
    developer_stripe_ready: bool = False
    developer_stripe_account_id: str | None = None
    payments: list[ProjectMemberPaymentResponse] = Field(default_factory=list)
    invited_at: datetime
    responded_at: datetime | None = None
    removed_at: datetime | None = None
    removal_reason: str | None = None


class ProjectMemberListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    items: list[ProjectMemberResponse]


class DeveloperInviteResponse(BaseModel):
    """Pre-acceptance view: enough to decide, and nothing more."""

    model_config = ConfigDict(extra="forbid")

    id: UUID
    project_id: UUID
    project_title: str
    founder_name: str
    phase_index: int
    status: ProjectMemberStatus
    amount_agreed_cents: int
    counter_amount_cents: int | None = None
    invited_at: datetime


class DeveloperInviteListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    items: list[DeveloperInviteResponse]


class CommentCreate(BaseModel):
    """Shared by issue and deliverable comments — both take just a body."""

    model_config = ConfigDict(extra="forbid")

    body: str = Field(min_length=1, max_length=5000)


class CommentResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    author_id: UUID | None = None
    author_name: str
    author_initials: str
    body: str
    is_mine: bool
    created_at: datetime
    edited_at: datetime | None = None


class AttachmentResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    file_name: str
    content_type: str
    size_bytes: int
    url: str
    uploader_name: str
    is_mine: bool
    created_at: datetime


class IssueCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    priority: IssuePriority = IssuePriority.MEDIUM
    phase_index: int | None = Field(default=None, ge=0)
    assignee_id: UUID | None = None
    due_date: date | None = None


class IssueUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    priority: IssuePriority | None = None
    phase_index: int | None = Field(default=None, ge=0)
    assignee_id: UUID | None = None
    due_date: date | None = None
    clear_assignee: bool = False
    clear_due_date: bool = False


class IssueStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: IssueStatus


class IssueResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    project_id: UUID
    phase_index: int | None = None
    title: str
    description: str
    priority: IssuePriority
    status: IssueStatus
    reporter_id: UUID | None = None
    reporter_name: str | None = None
    assignee_id: UUID | None = None
    assignee_name: str | None = None
    assignee_initials: str | None = None
    due_date: date | None = None
    assigned_to_me: bool
    can_edit: bool
    allowed_status_transitions: list[IssueStatus]
    comment_count: int
    attachment_count: int
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None = None


class IssueDetailResponse(IssueResponse):
    model_config = ConfigDict(extra="forbid")

    comments: list[CommentResponse]
    attachments: list[AttachmentResponse]


class IssueListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    items: list[IssueResponse]


class ProjectAssigneeOption(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: UUID
    name: str
    initials: str
    phase_indices: list[int]


class ProjectAssigneeListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[ProjectAssigneeOption]


class DeadlineCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    note: str = Field(min_length=1, max_length=500)
    due_date: date
    priority: IssuePriority = IssuePriority.MEDIUM
    phase_index: int | None = Field(default=None, ge=0)
    assignee_ids: list[UUID] = []


class DeadlineUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    note: str | None = Field(default=None, min_length=1, max_length=500)
    due_date: date | None = None
    priority: IssuePriority | None = None
    phase_index: int | None = Field(default=None, ge=0)
    status: DeadlineStatus | None = None
    assignee_ids: list[UUID] | None = None


class DeadlineAssigneeResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: UUID
    name: str
    initials: str
    met_at: datetime | None = None


class DeadlineResponse(BaseModel):
    """A calendar entry: either a standalone deadline, or a due date derived
    from an issue or a deliverable. Derived entries always have ``can_edit``
    false — editing them means editing the issue or deliverable itself."""

    model_config = ConfigDict(extra="forbid")

    id: UUID
    project_id: UUID
    source: str = "deadline"
    phase_index: int | None = None
    note: str
    priority: IssuePriority
    due_date: date
    status: DeadlineStatus
    assignees: list[DeadlineAssigneeResponse]
    assigned_to_me: bool
    met_by_me: bool
    can_edit: bool
    created_at: datetime


class DeadlineMetUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    met: bool


class DeadlineListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    items: list[DeadlineResponse]


class DeliverableCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(min_length=1, max_length=500)
    description: str = ""
    phase_index: int = Field(ge=0)
    due_date: date | None = None


class DeliverableUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = None
    due_date: date | None = None
    clear_due_date: bool = False


class DeliverableStatusUpdate(BaseModel):
    """Moving a deliverable may carry a comment in the same request, so raising
    a concern or noting how it was finished takes one action."""

    model_config = ConfigDict(extra="forbid")

    status: DeliverableStatus
    comment: str | None = Field(default=None, max_length=5000)


class DeliverableSummaryResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    project_id: UUID
    phase_index: int
    position: int
    text: str
    status: DeliverableStatus
    done: bool
    due_date: date | None = None
    can_toggle: bool
    next_statuses: list[DeliverableStatus]
    can_edit: bool
    comment_count: int
    attachment_count: int


class DeliverableDetailResponse(DeliverableSummaryResponse):
    model_config = ConfigDict(extra="forbid")

    description: str
    comments: list[CommentResponse]
    attachments: list[AttachmentResponse]


class DeliverableListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    items: list[DeliverableSummaryResponse]


class DeveloperPhaseResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    phase_index: int
    status: str
    deadline: date | None = None
    is_mine: bool
    deliverables: list[DeliverableSummaryResponse]


class DeveloperPaymentResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    phase_index: int
    amount_cents: int
    currency: str
    status: PaymentStatus
    provider: PaymentProvider
    created_at: datetime
    settled_at: datetime | None = None


class DeveloperEngagementResponse(BaseModel):
    """One phase the developer was hired for. A developer may hold several on the
    same project, each with its own agreed fee and its own settled total."""

    model_config = ConfigDict(extra="forbid")

    phase_index: int
    agreed_cents: int
    paid_cents: int


class DeveloperEarningsResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    currency: str
    agreed_cents: int
    paid_cents: int
    outstanding_cents: int
    engagements: list[DeveloperEngagementResponse]
    payments: list[DeveloperPaymentResponse]


class DeveloperProjectSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    blueprint_id: UUID
    founder_id: UUID
    founder_name: str
    title: str
    status: ProjectStatus
    my_phase_indices: list[int]
    deliverables_done: int
    deliverables_total: int
    open_issues: int
    next_deadline: date | None = None
    earnings: DeveloperEarningsResponse


class DeveloperProjectDetail(DeveloperProjectSummary):
    model_config = ConfigDict(extra="forbid")

    phases: list[DeveloperPhaseResponse]
    issues: list[IssueResponse]
    deadlines: list[DeadlineResponse]


class DeveloperProjectListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    items: list[DeveloperProjectSummary]
