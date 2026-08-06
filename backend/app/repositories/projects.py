from __future__ import annotations

from datetime import date, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.project import (
    ACTIVE_MEMBER_STATUSES,
    DeadlineStatus,
    DeliverableStatus,
    IssuePriority,
    IssueStatus,
    PaymentProvider,
    PaymentStatus,
    Project,
    ProjectAttachment,
    ProjectComment,
    ProjectDeadline,
    ProjectDeliverable,
    ProjectIssue,
    ProjectMember,
    ProjectMemberStatus,
    ProjectPayment,
    ProjectStatus,
)


def get_project_by_id(db: Session, project_id: UUID) -> Project | None:
    return db.get(Project, project_id)


def get_project_by_blueprint_id(db: Session, blueprint_id: UUID) -> Project | None:
    return db.scalar(select(Project).where(Project.blueprint_id == blueprint_id))


def list_projects_for_founder(
    db: Session,
    founder_id: UUID,
    *,
    limit: int,
    offset: int,
) -> tuple[list[Project], int]:
    total: int = (
        db.scalar(
            select(func.count()).select_from(Project).where(Project.founder_id == founder_id)
        )
        or 0
    )
    items = list(
        db.scalars(
            select(Project)
            .where(Project.founder_id == founder_id)
            .order_by(Project.created_at.desc())
            .limit(limit)
            .offset(offset)
        ).all()
    )
    return items, total


def create_project(
    db: Session,
    *,
    blueprint_id: UUID,
    founder_id: UUID,
    title: str,
    milestones: list[dict[str, Any]] | None = None,
) -> Project:
    project = Project(
        blueprint_id=blueprint_id,
        founder_id=founder_id,
        title=title,
        status=ProjectStatus.ACTIVE,
        milestones=milestones,
    )
    db.add(project)
    db.flush()
    return project


def update_project_status(db: Session, project: Project, status: ProjectStatus) -> Project:
    project.status = status
    return project


def update_project_milestones(
    db: Session, project: Project, milestones: list[dict[str, Any]]
) -> Project:
    project.milestones = milestones
    return project


def assign_developer(db: Session, project: Project, developer_id: UUID | None) -> Project:
    project.developer_id = developer_id
    return project


def create_member(
    db: Session,
    *,
    project_id: UUID,
    developer_id: UUID,
    phase_index: int,
    amount_agreed_cents: int,
) -> ProjectMember:
    member = ProjectMember(
        project_id=project_id,
        developer_id=developer_id,
        phase_index=phase_index,
        amount_agreed_cents=amount_agreed_cents,
        status=ProjectMemberStatus.INVITED,
    )
    db.add(member)
    db.flush()
    return member


def get_member_by_id(db: Session, member_id: UUID) -> ProjectMember | None:
    return db.get(ProjectMember, member_id)


def get_active_membership(
    db: Session, project_id: UUID, phase_index: int, developer_id: UUID
) -> ProjectMember | None:
    return db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.phase_index == phase_index,
            ProjectMember.developer_id == developer_id,
            ProjectMember.status.in_(ACTIVE_MEMBER_STATUSES),
        )
    )


def list_members_for_project(db: Session, project_id: UUID) -> list[ProjectMember]:
    return list(
        db.scalars(
            select(ProjectMember)
            .where(ProjectMember.project_id == project_id)
            .order_by(ProjectMember.phase_index, ProjectMember.invited_at)
        ).all()
    )


def list_pending_invites_for_developer(db: Session, developer_id: UUID) -> list[ProjectMember]:
    return list(
        db.scalars(
            select(ProjectMember)
            .where(
                ProjectMember.developer_id == developer_id,
                ProjectMember.status == ProjectMemberStatus.INVITED,
            )
            .order_by(ProjectMember.invited_at.desc())
        ).all()
    )


def list_accepted_memberships_for_developer(
    db: Session, developer_id: UUID
) -> list[ProjectMember]:
    return list(
        db.scalars(
            select(ProjectMember)
            .where(
                ProjectMember.developer_id == developer_id,
                ProjectMember.status == ProjectMemberStatus.ACCEPTED,
            )
            .order_by(ProjectMember.phase_index)
        ).all()
    )


def list_memberships_on_project(
    db: Session, project_id: UUID, developer_id: UUID
) -> list[ProjectMember]:
    return list(
        db.scalars(
            select(ProjectMember)
            .where(
                ProjectMember.project_id == project_id,
                ProjectMember.developer_id == developer_id,
            )
            .order_by(ProjectMember.phase_index)
        ).all()
    )


def list_projects_by_ids(db: Session, project_ids: list[UUID]) -> list[Project]:
    if not project_ids:
        return []
    return list(
        db.scalars(
            select(Project)
            .where(Project.id.in_(project_ids))
            .order_by(Project.created_at.desc())
        ).all()
    )


def list_deliverables(db: Session, project_id: UUID) -> list[ProjectDeliverable]:
    return list(
        db.scalars(
            select(ProjectDeliverable)
            .where(ProjectDeliverable.project_id == project_id)
            .order_by(ProjectDeliverable.phase_index, ProjectDeliverable.position)
        ).all()
    )


def create_payment(
    db: Session,
    *,
    project_id: UUID,
    member_id: UUID,
    amount_cents: int,
    currency: str,
    status: PaymentStatus,
    provider: PaymentProvider,
    provider_ref: str | None,
    idempotency_key: str,
    initiated_by: UUID,
    failure_reason: str | None,
    settled_at: datetime | None,
) -> ProjectPayment:
    payment = ProjectPayment(
        project_id=project_id,
        member_id=member_id,
        amount_cents=amount_cents,
        currency=currency,
        status=status,
        provider=provider,
        provider_ref=provider_ref,
        idempotency_key=idempotency_key,
        initiated_by=initiated_by,
        failure_reason=failure_reason,
        settled_at=settled_at,
    )
    db.add(payment)
    db.flush()
    return payment


def sum_settled_payments_by_member(db: Session, member_ids: list[UUID]) -> dict[UUID, int]:
    if not member_ids:
        return {}
    rows = db.execute(
        select(ProjectPayment.member_id, func.sum(ProjectPayment.amount_cents))
        .where(
            ProjectPayment.member_id.in_(member_ids),
            ProjectPayment.status == PaymentStatus.SUCCEEDED,
        )
        .group_by(ProjectPayment.member_id)
    ).all()
    return {row[0]: int(row[1] or 0) for row in rows}


def get_deliverable_by_id(db: Session, deliverable_id: UUID) -> ProjectDeliverable | None:
    return db.get(ProjectDeliverable, deliverable_id)


def list_issues(db: Session, project_id: UUID) -> list[ProjectIssue]:
    return list(
        db.scalars(
            select(ProjectIssue)
            .where(ProjectIssue.project_id == project_id)
            .order_by(ProjectIssue.created_at.desc())
        ).all()
    )


def phase_count(project: Project) -> int:
    milestones = project.milestones
    if not isinstance(milestones, list):
        return 0
    for entry in milestones:
        if isinstance(entry, dict) and entry.get("key") == "projectState":
            value = entry.get("value")
            if isinstance(value, dict) and isinstance(value.get("phaseStates"), list):
                return len(value["phaseStates"])
    return 0


def get_issue_by_id(db: Session, issue_id: UUID) -> ProjectIssue | None:
    return db.get(ProjectIssue, issue_id)


def create_issue(
    db: Session,
    *,
    project_id: UUID,
    title: str,
    description: str,
    priority: IssuePriority,
    phase_index: int | None,
    reporter_id: UUID,
    assignee_id: UUID | None,
    due_date: date | None,
) -> ProjectIssue:
    issue = ProjectIssue(
        project_id=project_id,
        title=title,
        description=description,
        priority=priority,
        status=IssueStatus.OPEN,
        phase_index=phase_index,
        reporter_id=reporter_id,
        assignee_id=assignee_id,
        due_date=due_date,
    )
    db.add(issue)
    db.flush()
    return issue


def get_comment_by_id(db: Session, comment_id: UUID) -> ProjectComment | None:
    return db.get(ProjectComment, comment_id)


def create_comment(
    db: Session,
    *,
    author_id: UUID,
    body: str,
    issue_id: UUID | None = None,
    deliverable_id: UUID | None = None,
) -> ProjectComment:
    comment = ProjectComment(
        issue_id=issue_id, deliverable_id=deliverable_id, author_id=author_id, body=body
    )
    db.add(comment)
    db.flush()
    return comment


def get_attachment_by_id(db: Session, attachment_id: UUID) -> ProjectAttachment | None:
    return db.get(ProjectAttachment, attachment_id)


def create_attachment(
    db: Session,
    *,
    uploader_id: UUID,
    storage_path: str,
    file_name: str,
    content_type: str,
    size_bytes: int,
    issue_id: UUID | None = None,
    deliverable_id: UUID | None = None,
) -> ProjectAttachment:
    attachment = ProjectAttachment(
        issue_id=issue_id,
        deliverable_id=deliverable_id,
        uploader_id=uploader_id,
        storage_path=storage_path,
        file_name=file_name,
        content_type=content_type,
        size_bytes=size_bytes,
    )
    db.add(attachment)
    db.flush()
    return attachment


def create_deliverable(
    db: Session,
    *,
    project_id: UUID,
    phase_index: int,
    text: str,
    description: str,
    due_date: date | None,
    position: int,
) -> ProjectDeliverable:
    deliverable = ProjectDeliverable(
        project_id=project_id,
        phase_index=phase_index,
        text=text,
        description=description,
        due_date=due_date,
        position=position,
        status=DeliverableStatus.TODO,
    )
    db.add(deliverable)
    db.flush()
    return deliverable


def next_deliverable_position(db: Session, project_id: UUID, phase_index: int) -> int:
    highest = db.scalar(
        select(func.max(ProjectDeliverable.position)).where(
            ProjectDeliverable.project_id == project_id,
            ProjectDeliverable.phase_index == phase_index,
        )
    )
    return (highest or -1) + 1


def list_deadlines(db: Session, project_id: UUID) -> list[ProjectDeadline]:
    return list(
        db.scalars(
            select(ProjectDeadline)
            .where(ProjectDeadline.project_id == project_id)
            .order_by(ProjectDeadline.due_date)
        ).all()
    )


def get_deadline_by_id(db: Session, deadline_id: UUID) -> ProjectDeadline | None:
    return db.get(ProjectDeadline, deadline_id)


def create_deadline(
    db: Session,
    *,
    project_id: UUID,
    note: str,
    due_date: date,
    priority: IssuePriority,
    phase_index: int | None,
    created_by: UUID,
) -> ProjectDeadline:
    deadline = ProjectDeadline(
        project_id=project_id,
        note=note,
        due_date=due_date,
        priority=priority,
        phase_index=phase_index,
        status=DeadlineStatus.PENDING,
        created_by=created_by,
    )
    db.add(deadline)
    db.flush()
    return deadline


def list_payments_for_members(db: Session, member_ids: list[UUID]) -> list[ProjectPayment]:
    if not member_ids:
        return []
    return list(
        db.scalars(
            select(ProjectPayment)
            .where(ProjectPayment.member_id.in_(member_ids))
            .order_by(ProjectPayment.created_at.desc())
        ).all()
    )


def count_deliverables_by_project(
    db: Session, project_ids: list[UUID]
) -> dict[UUID, tuple[int, int]]:
    if not project_ids:
        return {}
    rows = db.execute(
        select(
            ProjectDeliverable.project_id,
            func.count(ProjectDeliverable.id),
            func.count(ProjectDeliverable.id).filter(
                ProjectDeliverable.status == DeliverableStatus.DONE
            ),
        )
        .where(ProjectDeliverable.project_id.in_(project_ids))
        .group_by(ProjectDeliverable.project_id)
    ).all()
    return {row[0]: (row[2], row[1]) for row in rows}
