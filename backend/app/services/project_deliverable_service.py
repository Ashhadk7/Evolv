"""Deliverable authoring and collaboration.

A deliverable is a ticket like an issue: it has a description, comments and
attachments, and clicking it opens a detail view rather than toggling state
inline. The founder creates, edits and deletes deliverables; whoever holds
the phase — founder or the accepted developer — may mark one done, optionally
leaving a comment in the same action.
"""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import BackgroundTasks
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.project import DeliverableStatus, ProjectDeliverable, ProjectMemberStatus
from app.models.user import User
from app.repositories import projects as projects_repository
from app.schemas.projects import (
    AttachmentResponse,
    CommentResponse,
    DeliverableCreate,
    DeliverableDetailResponse,
    DeliverableSummaryResponse,
    DeliverableUpdate,
)
from app.services import notifications_service, project_collaboration_service
from app.services.exceptions import (
    ProjectAccessDeniedError,
    ProjectInvalidPhaseError,
    ProjectMemberConflictError,
    ProjectMemberNotFoundError,
    ProjectPersistenceError,
)
from app.services.project_access import Access, require_access


DEVELOPER_TRANSITIONS: dict[DeliverableStatus, list[DeliverableStatus]] = {
    DeliverableStatus.TODO: [DeliverableStatus.IN_PROGRESS],
    DeliverableStatus.IN_PROGRESS: [DeliverableStatus.IN_REVIEW, DeliverableStatus.TODO],
    DeliverableStatus.IN_REVIEW: [DeliverableStatus.IN_PROGRESS],
    DeliverableStatus.DONE: [],
}


def _commit(db: Session, message: str) -> None:
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError(message) from exc


def _deliverable_access(
    db: Session, deliverable_id: UUID, user: User
) -> tuple[ProjectDeliverable, Access]:
    deliverable = projects_repository.get_deliverable_by_id(db, deliverable_id)
    if deliverable is None:
        raise ProjectMemberNotFoundError("Deliverable not found.")
    return deliverable, require_access(db, deliverable.project_id, user)


def _can_toggle(deliverable: ProjectDeliverable, access: Access) -> bool:
    return access.is_founder or deliverable.phase_index in access.member_phases


def _allowed_transitions(
    deliverable: ProjectDeliverable, access: Access
) -> list[DeliverableStatus]:
    """The founder signs work off; a developer can carry it as far as review."""
    if not _can_toggle(deliverable, access):
        return []
    if access.is_founder:
        return [s for s in DeliverableStatus if s != deliverable.status]
    return DEVELOPER_TRANSITIONS[deliverable.status]


def _summary(deliverable: ProjectDeliverable, access: Access) -> DeliverableSummaryResponse:
    return DeliverableSummaryResponse(
        id=deliverable.id,
        project_id=deliverable.project_id,
        phase_index=deliverable.phase_index,
        position=deliverable.position,
        text=deliverable.text,
        status=deliverable.status,
        done=deliverable.done,
        due_date=deliverable.due_date,
        can_toggle=_can_toggle(deliverable, access),
        next_statuses=_allowed_transitions(deliverable, access),
        can_edit=access.is_founder,
        comment_count=len(project_collaboration_service.visible_comments(deliverable.comments)),
        attachment_count=len(deliverable.attachments),
    )


def _recipient_for(db: Session, deliverable: ProjectDeliverable, access: Access) -> UUID | None:
    """The other side of the conversation: the founder when a developer acts,
    or the phase's accepted developer when the founder acts."""
    if not access.is_founder:
        return access.project.founder_id
    members = projects_repository.list_members_for_project(db, deliverable.project_id)
    holder = next(
        (
            m
            for m in members
            if m.phase_index == deliverable.phase_index
            and m.status == ProjectMemberStatus.ACCEPTED
        ),
        None,
    )
    return holder.developer_id if holder else None


def _validate_phase(access: Access, phase_index: int) -> None:
    count = projects_repository.phase_count(access.project)
    if count and phase_index >= count:
        raise ProjectInvalidPhaseError(
            f"This project has {count} phase(s); phase {phase_index + 1} does not exist."
        )


def list_for_project(db: Session, project_id: UUID, user: User) -> list[DeliverableSummaryResponse]:
    access = require_access(db, project_id, user)
    deliverables = projects_repository.list_deliverables(db, project_id)
    return [_summary(d, access) for d in deliverables]


def get_deliverable(db: Session, deliverable_id: UUID, user: User) -> DeliverableDetailResponse:
    deliverable, access = _deliverable_access(db, deliverable_id, user)
    base = _summary(deliverable, access)
    return DeliverableDetailResponse(
        **base.model_dump(),
        description=deliverable.description,
        comments=[
            project_collaboration_service.comment_response(c, access.user_id)
            for c in project_collaboration_service.visible_comments(deliverable.comments)
        ],
        attachments=[
            project_collaboration_service.attachment_response(a, access.user_id)
            for a in sorted(deliverable.attachments, key=lambda a: a.created_at)
        ],
    )


def create_deliverable(
    db: Session, project_id: UUID, user: User, payload: DeliverableCreate
) -> DeliverableSummaryResponse:
    access = require_access(db, project_id, user)
    if not access.is_founder:
        raise ProjectAccessDeniedError("Only the founder can add deliverables.")
    _validate_phase(access, payload.phase_index)

    position = projects_repository.next_deliverable_position(db, project_id, payload.phase_index)
    deliverable = projects_repository.create_deliverable(
        db,
        project_id=project_id,
        phase_index=payload.phase_index,
        text=payload.text.strip(),
        description=payload.description.strip(),
        due_date=payload.due_date,
        position=position,
    )
    _commit(db, "The deliverable could not be saved.")
    db.refresh(deliverable)
    return _summary(deliverable, access)


def update_deliverable(
    db: Session, deliverable_id: UUID, user: User, payload: DeliverableUpdate
) -> DeliverableSummaryResponse:
    deliverable, access = _deliverable_access(db, deliverable_id, user)
    if not access.is_founder:
        raise ProjectAccessDeniedError("Only the founder can edit a deliverable.")

    if payload.text is not None:
        deliverable.text = payload.text.strip()
    if payload.description is not None:
        deliverable.description = payload.description.strip()
    if payload.clear_due_date:
        deliverable.due_date = None
    elif payload.due_date is not None:
        deliverable.due_date = payload.due_date

    _commit(db, "The deliverable could not be updated.")
    db.refresh(deliverable)
    return _summary(deliverable, access)


def delete_deliverable(db: Session, deliverable_id: UUID, user: User) -> None:
    deliverable, access = _deliverable_access(db, deliverable_id, user)
    if not access.is_founder:
        raise ProjectAccessDeniedError("Only the founder can remove a deliverable.")

    db.delete(deliverable)
    _commit(db, "The deliverable could not be removed.")


def set_status(
    db: Session,
    deliverable_id: UUID,
    user: User,
    *,
    status: DeliverableStatus,
    comment: str | None,
    background_tasks: BackgroundTasks | None = None,
) -> DeliverableSummaryResponse:
    deliverable, access = _deliverable_access(db, deliverable_id, user)

    if status not in _allowed_transitions(deliverable, access):
        if not _can_toggle(deliverable, access):
            raise ProjectAccessDeniedError(
                "You can only update deliverables on a phase you are assigned to."
            )
        if status == DeliverableStatus.DONE:
            raise ProjectAccessDeniedError(
                "Only the founder can sign a deliverable off as done."
            )
        raise ProjectMemberConflictError(
            f"A deliverable that is {deliverable.status.value} cannot move to {status.value}."
        )

    deliverable.status = status
    is_done = status == DeliverableStatus.DONE
    deliverable.completed_by = access.user_id if is_done else None
    deliverable.completed_at = datetime.now(UTC) if is_done else None
    _commit(db, "The deliverable could not be updated.")
    db.refresh(deliverable)

    if comment and comment.strip():
        project_collaboration_service.add_comment(
            db, deliverable_id=deliverable.id, author_id=user.id, body=comment
        )
        db.refresh(deliverable)

    recipient_id = _recipient_for(db, deliverable, access)
    if recipient_id is not None and recipient_id != access.user_id:
        notifications_service.notify_deliverable_status(
            db,
            deliverable=deliverable,
            project=access.project,
            actor=user,
            recipient_id=recipient_id,
            status=status,
            background_tasks=background_tasks,
        )
    return _summary(deliverable, access)


def add_comment(
    db: Session,
    deliverable_id: UUID,
    user: User,
    body: str,
    background_tasks: BackgroundTasks | None = None,
) -> CommentResponse:
    deliverable, access = _deliverable_access(db, deliverable_id, user)
    comment = project_collaboration_service.add_comment(
        db, deliverable_id=deliverable.id, author_id=user.id, body=body
    )
    recipient_id = _recipient_for(db, deliverable, access)
    if recipient_id is not None and recipient_id != access.user_id:
        notifications_service.notify_deliverable_comment(
            db,
            deliverable=deliverable,
            project=access.project,
            actor=user,
            recipient_id=recipient_id,
            background_tasks=background_tasks,
        )
    return project_collaboration_service.comment_response(comment, access.user_id)


def add_attachment(
    db: Session,
    deliverable_id: UUID,
    user: User,
    *,
    data: bytes,
    content_type: str,
    file_name: str,
) -> AttachmentResponse:
    _, access = _deliverable_access(db, deliverable_id, user)
    attachment = project_collaboration_service.add_attachment(
        db,
        deliverable_id=deliverable_id,
        uploader_id=user.id,
        data=data,
        content_type=content_type,
        file_name=file_name,
    )
    return project_collaboration_service.attachment_response(attachment, access.user_id)
