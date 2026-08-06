"""Issue authoring and collaboration.

Workflow: a developer moves an issue they are assigned through
``open -> in_progress -> in_review``; only the founder marks it ``resolved`` or
reopens it. Every accepted member reads and comments on every issue.
"""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.project import IssueStatus, Project, ProjectIssue, ProjectMemberStatus
from app.models.user import User
from app.repositories import projects as projects_repository
from app.repositories import users as users_repository
from app.schemas.projects import (
    AttachmentResponse,
    CommentResponse,
    IssueCreate,
    IssueDetailResponse,
    IssueResponse,
    IssueUpdate,
    ProjectAssigneeOption,
)
from app.services import notifications_service, project_collaboration_service
from app.services.exceptions import (
    ProjectAccessDeniedError,
    ProjectInvalidPhaseError,
    ProjectMemberConflictError,
    ProjectMemberNotFoundError,
    ProjectPersistenceError,
)
from app.services.project_access import Access, display_name, initials, require_access

DEVELOPER_TRANSITIONS: dict[IssueStatus, list[IssueStatus]] = {
    IssueStatus.OPEN: [IssueStatus.IN_PROGRESS],
    IssueStatus.IN_PROGRESS: [IssueStatus.IN_REVIEW, IssueStatus.OPEN],
    IssueStatus.IN_REVIEW: [IssueStatus.IN_PROGRESS],
    IssueStatus.RESOLVED: [],
}


def _now() -> datetime:
    return datetime.now(UTC)


def _issue_access(db: Session, issue_id: UUID, user: User) -> tuple[ProjectIssue, Access]:
    issue = projects_repository.get_issue_by_id(db, issue_id)
    if issue is None:
        raise ProjectMemberNotFoundError("Issue not found.")
    return issue, require_access(db, issue.project_id, user)


def _allowed_transitions(issue: ProjectIssue, access: Access) -> list[IssueStatus]:
    if access.is_founder:
        return [s for s in IssueStatus if s != issue.status]
    if issue.assignee_id != access.user_id:
        return []
    return DEVELOPER_TRANSITIONS[issue.status]


def _issue_response(db: Session, issue: ProjectIssue, access: Access) -> IssueResponse:
    assignee_name = display_name(issue.assignee) if issue.assignee else None
    return IssueResponse(
        id=issue.id,
        project_id=issue.project_id,
        phase_index=issue.phase_index,
        title=issue.title,
        description=issue.description,
        priority=issue.priority,
        status=issue.status,
        reporter_id=issue.reporter_id,
        reporter_name=display_name(issue.reporter) if issue.reporter else None,
        assignee_id=issue.assignee_id,
        assignee_name=assignee_name,
        assignee_initials=initials(assignee_name) if assignee_name else None,
        due_date=issue.due_date,
        assigned_to_me=issue.assignee_id == access.user_id,
        can_edit=access.is_founder,
        allowed_status_transitions=_allowed_transitions(issue, access),
        comment_count=len(project_collaboration_service.visible_comments(issue.comments)),
        attachment_count=len(issue.attachments),
        created_at=issue.created_at,
        updated_at=issue.updated_at,
        resolved_at=issue.resolved_at,
    )


def _validate_assignee(db: Session, project_id: UUID, assignee_id: UUID) -> None:
    members = projects_repository.list_members_for_project(db, project_id)
    accepted = {
        m.developer_id for m in members if m.status == ProjectMemberStatus.ACCEPTED
    }
    if assignee_id not in accepted:
        raise ProjectMemberConflictError(
            "You can only assign an issue to a developer who has accepted a phase on this project."
        )


def _validate_phase(project: Project, phase_index: int | None) -> None:
    if phase_index is None:
        return
    count = projects_repository.phase_count(project)
    if count and phase_index >= count:
        raise ProjectInvalidPhaseError(
            f"This project has {count} phase(s); phase {phase_index + 1} does not exist."
        )


def _commit(db: Session, message: str) -> None:
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError(message) from exc


def list_issues(db: Session, project_id: UUID, user: User) -> list[IssueResponse]:
    access = require_access(db, project_id, user)
    issues = projects_repository.list_issues(db, project_id)
    return [_issue_response(db, issue, access) for issue in issues]


def get_issue(db: Session, issue_id: UUID, user: User) -> IssueDetailResponse:
    issue, access = _issue_access(db, issue_id, user)
    base = _issue_response(db, issue, access)
    return IssueDetailResponse(
        **base.model_dump(),
        comments=[
            project_collaboration_service.comment_response(c, access.user_id)
            for c in project_collaboration_service.visible_comments(issue.comments)
        ],
        attachments=[
            project_collaboration_service.attachment_response(a, access.user_id)
            for a in sorted(issue.attachments, key=lambda a: a.created_at)
        ],
    )


def list_assignees(db: Session, project_id: UUID, user: User) -> list[ProjectAssigneeOption]:
    require_access(db, project_id, user)
    members = projects_repository.list_members_for_project(db, project_id)
    grouped: dict[UUID, list[int]] = {}
    for member in members:
        if member.status == ProjectMemberStatus.ACCEPTED:
            grouped.setdefault(member.developer_id, []).append(member.phase_index)

    options = []
    for developer_id, phases in grouped.items():
        name = display_name(users_repository.get_user_by_id(db, developer_id))
        options.append(
            ProjectAssigneeOption(
                user_id=developer_id,
                name=name,
                initials=initials(name),
                phase_indices=sorted(phases),
            )
        )
    return sorted(options, key=lambda o: o.name)


def create_issue(
    db: Session, project_id: UUID, user: User, payload: IssueCreate
) -> IssueResponse:
    access = require_access(db, project_id, user)
    if not access.is_founder:
        raise ProjectAccessDeniedError("Only the founder can raise issues on this project.")

    _validate_phase(access.project, payload.phase_index)
    if payload.assignee_id is not None:
        _validate_assignee(db, project_id, payload.assignee_id)

    issue = projects_repository.create_issue(
        db,
        project_id=project_id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        priority=payload.priority,
        phase_index=payload.phase_index,
        reporter_id=user.id,
        assignee_id=payload.assignee_id,
        due_date=payload.due_date,
    )
    _commit(db, "The issue could not be saved.")
    db.refresh(issue)

    _notify_assignment(db, issue, access)
    return _issue_response(db, issue, access)


def update_issue(
    db: Session, issue_id: UUID, user: User, payload: IssueUpdate
) -> IssueResponse:
    issue, access = _issue_access(db, issue_id, user)
    if not access.is_founder:
        raise ProjectAccessDeniedError("Only the founder can edit issue details.")

    previous_assignee = issue.assignee_id

    if payload.title is not None:
        issue.title = payload.title.strip()
    if payload.description is not None:
        issue.description = payload.description.strip()
    if payload.priority is not None:
        issue.priority = payload.priority
    if payload.phase_index is not None:
        _validate_phase(access.project, payload.phase_index)
        issue.phase_index = payload.phase_index
    if payload.clear_due_date:
        issue.due_date = None
    elif payload.due_date is not None:
        issue.due_date = payload.due_date
    if payload.clear_assignee:
        issue.assignee_id = None
    elif payload.assignee_id is not None:
        _validate_assignee(db, issue.project_id, payload.assignee_id)
        issue.assignee_id = payload.assignee_id

    _commit(db, "The issue could not be updated.")
    db.refresh(issue)

    if issue.assignee_id is not None and issue.assignee_id != previous_assignee:
        _notify_assignment(db, issue, access)
    return _issue_response(db, issue, access)


def set_issue_status(
    db: Session, issue_id: UUID, user: User, status: IssueStatus
) -> IssueResponse:
    issue, access = _issue_access(db, issue_id, user)

    if status not in _allowed_transitions(issue, access):
        if not access.is_founder and issue.assignee_id != access.user_id:
            raise ProjectAccessDeniedError(
                "You can only change the status of an issue assigned to you."
            )
        raise ProjectMemberConflictError(
            f"An issue that is {issue.status.value} cannot move to {status.value}."
        )

    issue.status = status
    issue.resolved_at = _now() if status == IssueStatus.RESOLVED else None
    _commit(db, "The issue status could not be updated.")
    db.refresh(issue)

    _notify_status(db, issue, access, status)
    return _issue_response(db, issue, access)


def add_comment(db: Session, issue_id: UUID, user: User, body: str) -> CommentResponse:
    issue, access = _issue_access(db, issue_id, user)
    comment = project_collaboration_service.add_comment(
        db, issue_id=issue.id, author_id=user.id, body=body
    )
    _notify_comment(db, issue, access)
    return project_collaboration_service.comment_response(comment, access.user_id)


def add_attachment(
    db: Session,
    issue_id: UUID,
    user: User,
    *,
    data: bytes,
    content_type: str,
    file_name: str,
) -> AttachmentResponse:
    _, access = _issue_access(db, issue_id, user)
    attachment = project_collaboration_service.add_attachment(
        db,
        issue_id=issue_id,
        uploader_id=user.id,
        data=data,
        content_type=content_type,
        file_name=file_name,
    )
    return project_collaboration_service.attachment_response(attachment, access.user_id)


def _notify_assignment(db: Session, issue: ProjectIssue, access: Access) -> None:
    if issue.assignee_id is None or issue.assignee_id == access.user_id:
        return
    notifications_service.notify_issue_assigned(
        db, issue=issue, project=access.project, actor=access.user
    )


def _notify_status(
    db: Session, issue: ProjectIssue, access: Access, status: IssueStatus
) -> None:
    recipient = (
        access.project.founder_id if not access.is_founder else issue.assignee_id
    )
    if recipient is None or recipient == access.user_id:
        return
    notifications_service.notify_issue_status(
        db,
        issue=issue,
        project=access.project,
        actor=access.user,
        status=status,
        recipient_id=recipient,
    )


def _notify_comment(db: Session, issue: ProjectIssue, access: Access) -> None:
    recipient = (
        access.project.founder_id if not access.is_founder else issue.assignee_id
    )
    if recipient is None or recipient == access.user_id:
        return
    notifications_service.notify_issue_comment(
        db, issue=issue, project=access.project, actor=access.user, recipient_id=recipient
    )
