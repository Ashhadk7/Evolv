"""Comments and attachments shared by issues and deliverables.

A comment or attachment belongs to exactly one target (an issue or a
deliverable); the caller passes whichever id it has and the database's
exactly-one-of check makes the alternative impossible.
"""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.project import ProjectAttachment, ProjectComment
from app.models.user import User
from app.repositories import projects as projects_repository
from app.schemas.projects import AttachmentResponse, CommentResponse
from app.services import storage as storage_service
from app.services.exceptions import (
    ProjectAccessDeniedError,
    ProjectMemberNotFoundError,
    ProjectPersistenceError,
)
from app.services.project_access import display_name, initials, require_access


def _now() -> datetime:
    return datetime.now(UTC)


def _commit(db: Session, message: str) -> None:
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError(message) from exc


def comment_response(comment: ProjectComment, viewer_id: UUID) -> CommentResponse:
    name = display_name(comment.author)
    return CommentResponse(
        id=comment.id,
        author_id=comment.author_id,
        author_name=name,
        author_initials=initials(name),
        body=comment.body,
        is_mine=comment.author_id == viewer_id,
        created_at=comment.created_at,
        edited_at=comment.edited_at,
    )


def attachment_response(attachment: ProjectAttachment, viewer_id: UUID) -> AttachmentResponse:
    return AttachmentResponse(
        id=attachment.id,
        file_name=attachment.file_name,
        content_type=attachment.content_type,
        size_bytes=attachment.size_bytes,
        url=storage_service.signed_attachment_url(attachment.storage_path),
        uploader_name=display_name(attachment.uploader),
        is_mine=attachment.uploader_id == viewer_id,
        created_at=attachment.created_at,
    )


def visible_comments(comments: list[ProjectComment]) -> list[ProjectComment]:
    return sorted((c for c in comments if c.deleted_at is None), key=lambda c: c.created_at)


def add_comment(
    db: Session,
    *,
    author_id: UUID,
    body: str,
    issue_id: UUID | None = None,
    deliverable_id: UUID | None = None,
) -> ProjectComment:
    comment = projects_repository.create_comment(
        db,
        issue_id=issue_id,
        deliverable_id=deliverable_id,
        author_id=author_id,
        body=body.strip(),
    )
    _commit(db, "The comment could not be saved.")
    db.refresh(comment)
    return comment


def update_comment(db: Session, comment_id: UUID, user: User, body: str) -> ProjectComment:
    comment = projects_repository.get_comment_by_id(db, comment_id)
    if comment is None or comment.deleted_at is not None:
        raise ProjectMemberNotFoundError("Comment not found.")
    if comment.author_id != user.id:
        raise ProjectAccessDeniedError("You can only edit your own comments.")

    comment.body = body.strip()
    comment.edited_at = _now()
    _commit(db, "The comment could not be updated.")
    db.refresh(comment)
    return comment


def delete_comment(db: Session, comment_id: UUID, user: User) -> None:
    comment = projects_repository.get_comment_by_id(db, comment_id)
    if comment is None or comment.deleted_at is not None:
        raise ProjectMemberNotFoundError("Comment not found.")
    if comment.author_id != user.id:
        raise ProjectAccessDeniedError("You can only delete your own comments.")

    comment.deleted_at = _now()
    _commit(db, "The comment could not be removed.")


def add_attachment(
    db: Session,
    *,
    uploader_id: UUID,
    data: bytes,
    content_type: str,
    file_name: str,
    issue_id: UUID | None = None,
    deliverable_id: UUID | None = None,
) -> ProjectAttachment:
    owner_id = issue_id or deliverable_id
    if owner_id is None:
        raise ProjectMemberNotFoundError("An attachment needs an issue or a deliverable.")
    path = storage_service.upload_attachment(owner_id, data, content_type)

    try:
        attachment = projects_repository.create_attachment(
            db,
            issue_id=issue_id,
            deliverable_id=deliverable_id,
            uploader_id=uploader_id,
            storage_path=path,
            file_name=file_name[:255],
            content_type=content_type,
            size_bytes=len(data),
        )
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        storage_service.delete_attachment(path)
        raise ProjectPersistenceError("The attachment could not be saved.") from exc

    db.refresh(attachment)
    return attachment


def _project_id_for_target(
    db: Session, *, issue_id: UUID | None, deliverable_id: UUID | None
) -> UUID:
    if issue_id is not None:
        issue = projects_repository.get_issue_by_id(db, issue_id)
        if issue is not None:
            return issue.project_id
    if deliverable_id is not None:
        deliverable = projects_repository.get_deliverable_by_id(db, deliverable_id)
        if deliverable is not None:
            return deliverable.project_id
    raise ProjectMemberNotFoundError("The item this belongs to could not be found.")


def delete_attachment(db: Session, attachment_id: UUID, user: User) -> None:
    attachment = projects_repository.get_attachment_by_id(db, attachment_id)
    if attachment is None:
        raise ProjectMemberNotFoundError("Attachment not found.")

    project_id = _project_id_for_target(
        db, issue_id=attachment.issue_id, deliverable_id=attachment.deliverable_id
    )
    access = require_access(db, project_id, user)
    if attachment.uploader_id != user.id and not access.is_founder:
        raise ProjectAccessDeniedError("You can only remove attachments you uploaded.")

    path = attachment.storage_path
    db.delete(attachment)
    _commit(db, "The attachment could not be removed.")
    storage_service.delete_attachment(path)
