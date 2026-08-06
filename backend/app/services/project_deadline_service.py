"""Deadline authoring.

The founder creates, edits and assigns deadlines. An assigned developer may only
mark their own line as met; they never change the date, the note or the roster.
"""

from __future__ import annotations

from datetime import UTC, date, datetime
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.project import (
    DeadlineStatus,
    IssuePriority,
    IssueStatus,
    ProjectDeadline,
    ProjectDeadlineAssignee,
    ProjectDeliverable,
    ProjectIssue,
    ProjectMemberStatus,
)
from app.models.user import User
from app.repositories import projects as projects_repository
from app.repositories import users as users_repository
from app.schemas.projects import (
    DeadlineAssigneeResponse,
    DeadlineCreate,
    DeadlineResponse,
    DeadlineUpdate,
)
from app.services import notifications_service
from app.services.exceptions import (
    ProjectAccessDeniedError,
    ProjectInvalidPhaseError,
    ProjectMemberConflictError,
    ProjectMemberNotFoundError,
    ProjectPersistenceError,
)
from app.services.project_access import Access, display_name, initials, require_access


def _now() -> datetime:
    return datetime.now(UTC)


def _response(db: Session, deadline: ProjectDeadline, access: Access) -> DeadlineResponse:
    assignees = []
    mine = None
    for row in deadline.assignees:
        name = display_name(users_repository.get_user_by_id(db, row.user_id))
        assignees.append(
            DeadlineAssigneeResponse(
                user_id=row.user_id,
                name=name,
                initials=initials(name),
                met_at=row.met_at,
            )
        )
        if row.user_id == access.user_id:
            mine = row

    return DeadlineResponse(
        id=deadline.id,
        project_id=deadline.project_id,
        source="deadline",
        phase_index=deadline.phase_index,
        note=deadline.note,
        priority=deadline.priority,
        due_date=deadline.due_date,
        status=deadline.status,
        assignees=sorted(assignees, key=lambda a: a.name),
        assigned_to_me=mine is not None,
        met_by_me=mine is not None and mine.met_at is not None,
        can_edit=access.is_founder,
        created_at=deadline.created_at,
    )


def _issue_deadline_status(issue: ProjectIssue) -> DeadlineStatus:
    if issue.status == IssueStatus.RESOLVED:
        return DeadlineStatus.MET
    if issue.due_date is not None and issue.due_date < date.today():
        return DeadlineStatus.MISSED
    return DeadlineStatus.PENDING


def _from_issue(issue: ProjectIssue, access: Access) -> DeadlineResponse:
    # Callers only reach here after filtering to issues with a due date.
    assert issue.due_date is not None
    return DeadlineResponse(
        id=issue.id,
        project_id=issue.project_id,
        source="issue",
        phase_index=issue.phase_index,
        note=issue.title,
        priority=issue.priority,
        due_date=issue.due_date,
        status=_issue_deadline_status(issue),
        assignees=[],
        assigned_to_me=issue.assignee_id == access.user_id,
        met_by_me=issue.status == IssueStatus.RESOLVED,
        can_edit=False,
        created_at=issue.created_at,
    )


def _deliverable_deadline_status(deliverable: ProjectDeliverable) -> DeadlineStatus:
    if deliverable.done:
        return DeadlineStatus.MET
    if deliverable.due_date is not None and deliverable.due_date < date.today():
        return DeadlineStatus.MISSED
    return DeadlineStatus.PENDING


def _from_deliverable(deliverable: ProjectDeliverable, access: Access) -> DeadlineResponse:
    # Callers only reach here after filtering to deliverables with a due date.
    assert deliverable.due_date is not None
    return DeadlineResponse(
        id=deliverable.id,
        project_id=deliverable.project_id,
        source="deliverable",
        phase_index=deliverable.phase_index,
        note=deliverable.text,
        priority=IssuePriority.MEDIUM,
        due_date=deliverable.due_date,
        status=_deliverable_deadline_status(deliverable),
        assignees=[],
        assigned_to_me=deliverable.phase_index in access.member_phases,
        met_by_me=deliverable.done,
        can_edit=False,
        created_at=deliverable.created_at,
    )


def _validate(
    db: Session, access: Access, phase_index: int | None, assignee_ids: list[UUID]
) -> None:
    if phase_index is not None:
        count = projects_repository.phase_count(access.project)
        if count and phase_index >= count:
            raise ProjectInvalidPhaseError(
                f"This project has {count} phase(s); phase {phase_index + 1} does not exist."
            )
    if not assignee_ids:
        return
    members = projects_repository.list_members_for_project(db, access.project.id)
    accepted = {m.developer_id for m in members if m.status == ProjectMemberStatus.ACCEPTED}
    unknown = [a for a in assignee_ids if a not in accepted]
    if unknown:
        raise ProjectMemberConflictError(
            "You can only assign a deadline to developers who have accepted a phase."
        )


def _commit(db: Session, message: str) -> None:
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError(message) from exc


def _require_founder(access: Access) -> None:
    if not access.is_founder:
        raise ProjectAccessDeniedError("Only the founder can manage deadlines.")


def list_deadlines(db: Session, project_id: UUID, user: User) -> list[DeadlineResponse]:
    """The full calendar: standalone deadlines plus every issue and deliverable
    that carries a due date, derived rather than duplicated so an edit to an
    issue or deliverable can never leave a stale calendar entry behind."""
    access = require_access(db, project_id, user)

    entries = [
        _response(db, deadline, access)
        for deadline in projects_repository.list_deadlines(db, project_id)
    ]
    entries.extend(
        _from_issue(issue, access)
        for issue in projects_repository.list_issues(db, project_id)
        if issue.due_date is not None
    )
    entries.extend(
        _from_deliverable(deliverable, access)
        for deliverable in projects_repository.list_deliverables(db, project_id)
        if deliverable.due_date is not None
    )
    return sorted(entries, key=lambda e: e.due_date)


def create_deadline(
    db: Session, project_id: UUID, user: User, payload: DeadlineCreate
) -> DeadlineResponse:
    access = require_access(db, project_id, user)
    _require_founder(access)
    _validate(db, access, payload.phase_index, payload.assignee_ids)

    deadline = projects_repository.create_deadline(
        db,
        project_id=project_id,
        note=payload.note.strip(),
        due_date=payload.due_date,
        priority=payload.priority,
        phase_index=payload.phase_index,
        created_by=user.id,
    )
    for assignee_id in payload.assignee_ids:
        db.add(ProjectDeadlineAssignee(deadline_id=deadline.id, user_id=assignee_id))
    _commit(db, "The deadline could not be saved.")
    db.refresh(deadline)

    for assignee_id in payload.assignee_ids:
        notifications_service.notify_deadline_assigned(
            db, deadline=deadline, project=access.project, actor=user, recipient_id=assignee_id
        )
    return _response(db, deadline, access)


def update_deadline(
    db: Session, deadline_id: UUID, user: User, payload: DeadlineUpdate
) -> DeadlineResponse:
    deadline = projects_repository.get_deadline_by_id(db, deadline_id)
    if deadline is None:
        raise ProjectMemberNotFoundError("Deadline not found.")
    access = require_access(db, deadline.project_id, user)
    _require_founder(access)
    _validate(db, access, payload.phase_index, payload.assignee_ids or [])

    if payload.note is not None:
        deadline.note = payload.note.strip()
    if payload.due_date is not None:
        deadline.due_date = payload.due_date
    if payload.priority is not None:
        deadline.priority = payload.priority
    if payload.phase_index is not None:
        deadline.phase_index = payload.phase_index
    if payload.status is not None:
        deadline.status = payload.status

    if payload.assignee_ids is not None:
        existing = {row.user_id: row for row in deadline.assignees}
        wanted = set(payload.assignee_ids)
        for user_id, row in existing.items():
            if user_id not in wanted:
                db.delete(row)
        for user_id in wanted - set(existing):
            db.add(ProjectDeadlineAssignee(deadline_id=deadline.id, user_id=user_id))

    _commit(db, "The deadline could not be updated.")
    db.refresh(deadline)
    return _response(db, deadline, access)


def delete_deadline(db: Session, deadline_id: UUID, user: User) -> None:
    deadline = projects_repository.get_deadline_by_id(db, deadline_id)
    if deadline is None:
        raise ProjectMemberNotFoundError("Deadline not found.")
    access = require_access(db, deadline.project_id, user)
    _require_founder(access)

    db.delete(deadline)
    _commit(db, "The deadline could not be removed.")


def set_met(db: Session, deadline_id: UUID, user: User, *, met: bool) -> DeadlineResponse:
    deadline = projects_repository.get_deadline_by_id(db, deadline_id)
    if deadline is None:
        raise ProjectMemberNotFoundError("Deadline not found.")
    access = require_access(db, deadline.project_id, user)

    row = next((r for r in deadline.assignees if r.user_id == access.user_id), None)
    if row is None:
        raise ProjectAccessDeniedError(
            "You can only update a deadline you have been assigned to."
        )

    row.met_at = _now() if met else None
    if deadline.assignees and all(r.met_at is not None for r in deadline.assignees):
        deadline.status = DeadlineStatus.MET
    elif deadline.status == DeadlineStatus.MET:
        deadline.status = DeadlineStatus.PENDING

    _commit(db, "The deadline could not be updated.")
    db.refresh(deadline)

    notifications_service.notify_deadline_progress(
        db,
        deadline=deadline,
        project=access.project,
        actor=user,
        recipient_id=access.project.founder_id,
        met=met,
    )
    return _response(db, deadline, access)
