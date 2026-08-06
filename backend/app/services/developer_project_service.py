"""Read model for the developer's view of a project.

Composes the per-domain services (issues, deadlines, deliverables, membership,
payments) rather than re-deriving their DTOs, so a developer sees exactly the
same issue/deadline/deliverable shape a founder does — just filtered to what
they're allowed to see.
"""

from __future__ import annotations

from datetime import date
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.project import (
    DeadlineStatus,
    IssueStatus,
    PaymentStatus,
    Project,
    ProjectMember,
    ProjectMemberStatus,
    ProjectPayment,
)
from app.models.user import User, UserRole
from app.repositories import projects as projects_repository
from app.repositories import users as users_repository
from app.schemas.projects import (
    DeveloperEarningsResponse,
    DeveloperEngagementResponse,
    DeveloperPaymentResponse,
    DeveloperPhaseResponse,
    DeveloperProjectDetail,
    DeveloperProjectSummary,
)
from app.services import (
    project_deadline_service,
    project_deliverable_service,
    project_issue_service,
)
from app.services.exceptions import (
    DeveloperProfileRequiredError,
    ProjectAccessDeniedError,
    ProjectNotFoundError,
)
from app.services.project_access import display_name

DEFAULT_CURRENCY = "USD"
OPEN_ISSUE_STATUSES = (IssueStatus.OPEN, IssueStatus.IN_PROGRESS, IssueStatus.IN_REVIEW)


def _require_developer(user: User) -> UUID:
    if user.role != UserRole.DEVELOPER or user.developer_profile is None:
        raise DeveloperProfileRequiredError(
            "Only developers with a developer profile can view assigned projects."
        )
    return user.developer_profile.user_id


def _phase_documents(project: Project) -> list[dict[str, Any]]:
    milestones = project.milestones
    if not isinstance(milestones, list):
        return []
    for entry in milestones:
        if isinstance(entry, dict) and entry.get("key") == "projectState":
            value = entry.get("value")
            if isinstance(value, dict) and isinstance(value.get("phaseStates"), list):
                return [ps for ps in value["phaseStates"] if isinstance(ps, dict)]
    return []


def _phase_at(phase_documents: list[dict[str, Any]], index: int) -> dict[str, Any]:
    return phase_documents[index] if index < len(phase_documents) else {}


def _phase_status(phase: dict[str, Any]) -> str:
    status = phase.get("status")
    return status if isinstance(status, str) and status else "Not Started"


def _phase_deadline(phase: dict[str, Any]) -> date | None:
    raw = phase.get("deadline")
    if not isinstance(raw, str):
        return None
    try:
        return date.fromisoformat(raw[:10])
    except ValueError:
        return None


def _earnings(
    memberships: list[ProjectMember], payments: list[ProjectPayment]
) -> DeveloperEarningsResponse:
    phase_of = {m.id: m.phase_index for m in memberships}
    agreed = sum(m.amount_agreed_cents for m in memberships)
    settled = [p for p in payments if p.status == PaymentStatus.SUCCEEDED]
    paid = sum(p.amount_cents for p in settled)
    currency = next((p.currency for p in payments), DEFAULT_CURRENCY)

    settled_by_phase: dict[int, int] = {}
    for payment in settled:
        phase_index = phase_of.get(payment.member_id)
        if phase_index is not None:
            settled_by_phase[phase_index] = (
                settled_by_phase.get(phase_index, 0) + payment.amount_cents
            )

    return DeveloperEarningsResponse(
        currency=currency,
        agreed_cents=agreed,
        paid_cents=paid,
        outstanding_cents=max(0, agreed - paid),
        engagements=[
            DeveloperEngagementResponse(
                phase_index=m.phase_index,
                agreed_cents=m.amount_agreed_cents,
                paid_cents=settled_by_phase.get(m.phase_index, 0),
            )
            for m in sorted(memberships, key=lambda m: m.phase_index)
        ],
        payments=[
            DeveloperPaymentResponse(
                id=p.id,
                phase_index=phase_of.get(p.member_id, 0),
                amount_cents=p.amount_cents,
                currency=p.currency,
                status=p.status,
                provider=p.provider,
                created_at=p.created_at,
                settled_at=p.settled_at,
            )
            for p in payments
        ],
    )


def _summary(
    project: Project,
    memberships: list[ProjectMember],
    payments: list[ProjectPayment],
    done: int,
    total: int,
    open_issues: int,
    next_deadline: date | None,
    founder_name: str,
) -> DeveloperProjectSummary:
    version = project.blueprint.current_version if project.blueprint is not None else None
    return DeveloperProjectSummary(
        id=project.id,
        blueprint_id=project.blueprint_id,
        founder_id=project.founder_id,
        founder_name=founder_name,
        title=version.name if version is not None else project.title,
        status=project.status,
        my_phase_indices=sorted({m.phase_index for m in memberships}),
        deliverables_done=done,
        deliverables_total=total,
        open_issues=open_issues,
        next_deadline=next_deadline,
        earnings=_earnings(memberships, payments),
    )


def list_projects(db: Session, current_user: User) -> list[DeveloperProjectSummary]:
    developer_id = _require_developer(current_user)
    memberships = projects_repository.list_accepted_memberships_for_developer(db, developer_id)
    if not memberships:
        return []

    by_project: dict[UUID, list[ProjectMember]] = {}
    for membership in memberships:
        by_project.setdefault(membership.project_id, []).append(membership)

    project_ids = list(by_project)
    projects = projects_repository.list_projects_by_ids(db, project_ids)
    counts = projects_repository.count_deliverables_by_project(db, project_ids)
    payments = projects_repository.list_payments_for_members(db, [m.id for m in memberships])

    payments_by_member: dict[UUID, list[ProjectPayment]] = {}
    for payment in payments:
        payments_by_member.setdefault(payment.member_id, []).append(payment)

    summaries = []
    for project in projects:
        project_members = by_project[project.id]
        done, total = counts.get(project.id, (0, 0))
        issues = projects_repository.list_issues(db, project.id)
        deadlines = projects_repository.list_deadlines(db, project.id)
        deliverables = projects_repository.list_deliverables(db, project.id)
        founder = users_repository.get_user_by_id(db, project.founder_id)
        upcoming = [d.due_date for d in deadlines if d.status == DeadlineStatus.PENDING]
        upcoming.extend(
            i.due_date for i in issues if i.due_date and i.status in OPEN_ISSUE_STATUSES
        )
        upcoming.extend(d.due_date for d in deliverables if d.due_date and not d.done)
        summaries.append(
            _summary(
                project,
                project_members,
                [p for m in project_members for p in payments_by_member.get(m.id, [])],
                done,
                total,
                sum(1 for i in issues if i.status in OPEN_ISSUE_STATUSES),
                min(upcoming) if upcoming else None,
                display_name(founder),
            )
        )
    return summaries


def get_project(db: Session, project_id: UUID, current_user: User) -> DeveloperProjectDetail:
    developer_id = _require_developer(current_user)

    project = projects_repository.get_project_by_id(db, project_id)
    if project is None:
        raise ProjectNotFoundError()

    memberships = projects_repository.list_memberships_on_project(db, project_id, developer_id)
    accepted = [m for m in memberships if m.status == ProjectMemberStatus.ACCEPTED]
    if not accepted:
        raise ProjectAccessDeniedError("You do not have access to this project.")

    my_phases = {m.phase_index for m in accepted}
    payments = projects_repository.list_payments_for_members(db, [m.id for m in accepted])

    deliverable_summaries = project_deliverable_service.list_for_project(
        db, project_id, current_user
    )
    by_phase: dict[int, list] = {}
    for deliverable in deliverable_summaries:
        by_phase.setdefault(deliverable.phase_index, []).append(deliverable)

    phase_documents = _phase_documents(project)
    phase_count = max([len(phase_documents), *(i + 1 for i in by_phase)], default=0)

    phases = [
        DeveloperPhaseResponse(
            phase_index=index,
            status=_phase_status(_phase_at(phase_documents, index)),
            deadline=_phase_deadline(_phase_at(phase_documents, index)),
            is_mine=index in my_phases,
            deliverables=by_phase.get(index, []),
        )
        for index in range(phase_count)
    ]

    issues = project_issue_service.list_issues(db, project_id, current_user)
    deadlines = project_deadline_service.list_deadlines(db, project_id, current_user)

    deliverables_done = sum(1 for d in deliverable_summaries if d.done)
    upcoming = [d.due_date for d in deadlines if d.status == DeadlineStatus.PENDING]
    founder = users_repository.get_user_by_id(db, project.founder_id)

    summary = _summary(
        project,
        accepted,
        payments,
        deliverables_done,
        len(deliverable_summaries),
        sum(1 for i in issues if i.status in OPEN_ISSUE_STATUSES),
        min(upcoming) if upcoming else None,
        display_name(founder),
    )

    return DeveloperProjectDetail(
        **summary.model_dump(),
        phases=phases,
        issues=issues,
        deadlines=deadlines,
    )


def is_accepted_member(db: Session, project_id: UUID, user: User) -> bool:
    if user.role != UserRole.DEVELOPER or user.developer_profile is None:
        return False
    memberships = projects_repository.list_memberships_on_project(
        db, project_id, user.developer_profile.user_id
    )
    return any(m.status == ProjectMemberStatus.ACCEPTED for m in memberships)
