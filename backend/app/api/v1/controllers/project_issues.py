from typing import Annotated
from uuid import UUID

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.projects import (
    AttachmentResponse,
    CommentCreate,
    CommentResponse,
    DeadlineCreate,
    DeadlineListResponse,
    DeadlineMetUpdate,
    DeadlineResponse,
    DeadlineUpdate,
    DeliverableCreate,
    DeliverableDetailResponse,
    DeliverableListResponse,
    DeliverableStatusUpdate,
    DeliverableSummaryResponse,
    DeliverableUpdate,
    IssueCreate,
    IssueDetailResponse,
    IssueListResponse,
    IssueResponse,
    IssueStatusUpdate,
    IssueUpdate,
    ProjectAssigneeListResponse,
)
from app.services import (
    project_collaboration_service,
    project_deadline_service,
    project_deliverable_service,
    project_issue_service,
)
from app.services import storage as storage_service

router = APIRouter()


async def _validated_upload(file: UploadFile) -> tuple[bytes, str]:
    content_type = (file.content_type or "").lower()
    if content_type not in storage_service.ALLOWED_ATTACHMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Attachments must be a PNG, JPEG, WebP, GIF or PDF.",
        )
    data = await file.read()
    if len(data) > storage_service.MAX_ATTACHMENT_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Attachments must be smaller than 10 MB.",
        )
    return data, content_type


@router.get("/{project_id}/issues", response_model=IssueListResponse)
def list_issues(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> IssueListResponse:
    items = project_issue_service.list_issues(db, project_id, current_user)
    return IssueListResponse(total=len(items), items=items)


@router.post(
    "/{project_id}/issues",
    response_model=IssueResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_issue(
    project_id: UUID,
    payload: IssueCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> IssueResponse:
    return project_issue_service.create_issue(db, project_id, current_user, payload)


@router.get("/{project_id}/deadlines", response_model=DeadlineListResponse)
def list_deadlines(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> DeadlineListResponse:
    items = project_deadline_service.list_deadlines(db, project_id, current_user)
    return DeadlineListResponse(total=len(items), items=items)


@router.post(
    "/{project_id}/deadlines",
    response_model=DeadlineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_deadline(
    project_id: UUID,
    payload: DeadlineCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> DeadlineResponse:
    return project_deadline_service.create_deadline(db, project_id, current_user, payload)


@router.patch("/deadlines/{deadline_id}", response_model=DeadlineResponse)
def update_deadline(
    deadline_id: UUID,
    payload: DeadlineUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> DeadlineResponse:
    return project_deadline_service.update_deadline(db, deadline_id, current_user, payload)


@router.delete("/deadlines/{deadline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deadline(
    deadline_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    project_deadline_service.delete_deadline(db, deadline_id, current_user)


@router.patch("/deadlines/{deadline_id}/met", response_model=DeadlineResponse)
def set_deadline_met(
    deadline_id: UUID,
    payload: DeadlineMetUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> DeadlineResponse:
    return project_deadline_service.set_met(db, deadline_id, current_user, met=payload.met)


@router.get("/{project_id}/assignees", response_model=ProjectAssigneeListResponse)
def list_assignees(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> ProjectAssigneeListResponse:
    return ProjectAssigneeListResponse(
        items=project_issue_service.list_assignees(db, project_id, current_user)
    )


@router.get("/issues/{issue_id}", response_model=IssueDetailResponse)
def get_issue(
    issue_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> IssueDetailResponse:
    return project_issue_service.get_issue(db, issue_id, current_user)


@router.patch("/issues/{issue_id}", response_model=IssueResponse)
def update_issue(
    issue_id: UUID,
    payload: IssueUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> IssueResponse:
    return project_issue_service.update_issue(db, issue_id, current_user, payload)


@router.patch("/issues/{issue_id}/status", response_model=IssueResponse)
def set_issue_status(
    issue_id: UUID,
    payload: IssueStatusUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> IssueResponse:
    return project_issue_service.set_issue_status(db, issue_id, current_user, payload.status)


@router.post(
    "/issues/{issue_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_issue_comment(
    issue_id: UUID,
    payload: CommentCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> CommentResponse:
    return project_issue_service.add_comment(db, issue_id, current_user, payload.body)


@router.post(
    "/issues/{issue_id}/attachments",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_issue_attachment(
    issue_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    file: Annotated[UploadFile, File()],
) -> AttachmentResponse:
    data, content_type = await _validated_upload(file)
    try:
        return project_issue_service.add_attachment(
            db,
            issue_id,
            current_user,
            data=data,
            content_type=content_type,
            file_name=file.filename or "attachment",
        )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="We couldn't upload that attachment right now. Please try again.",
        ) from exc


@router.get("/{project_id}/deliverables", response_model=DeliverableListResponse)
def list_deliverables(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> DeliverableListResponse:
    items = project_deliverable_service.list_for_project(db, project_id, current_user)
    return DeliverableListResponse(total=len(items), items=items)


@router.post(
    "/{project_id}/deliverables",
    response_model=DeliverableSummaryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_deliverable(
    project_id: UUID,
    payload: DeliverableCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> DeliverableSummaryResponse:
    return project_deliverable_service.create_deliverable(db, project_id, current_user, payload)


@router.get("/deliverables/{deliverable_id}", response_model=DeliverableDetailResponse)
def get_deliverable(
    deliverable_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> DeliverableDetailResponse:
    return project_deliverable_service.get_deliverable(db, deliverable_id, current_user)


@router.patch("/deliverables/{deliverable_id}", response_model=DeliverableSummaryResponse)
def update_deliverable(
    deliverable_id: UUID,
    payload: DeliverableUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> DeliverableSummaryResponse:
    return project_deliverable_service.update_deliverable(
        db, deliverable_id, current_user, payload
    )


@router.delete("/deliverables/{deliverable_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deliverable(
    deliverable_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    project_deliverable_service.delete_deliverable(db, deliverable_id, current_user)


@router.patch("/deliverables/{deliverable_id}/status", response_model=DeliverableSummaryResponse)
def set_deliverable_status(
    deliverable_id: UUID,
    payload: DeliverableStatusUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> DeliverableSummaryResponse:
    return project_deliverable_service.set_status(
        db, deliverable_id, current_user, status=payload.status, comment=payload.comment
    )


@router.post(
    "/deliverables/{deliverable_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_deliverable_comment(
    deliverable_id: UUID,
    payload: CommentCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> CommentResponse:
    return project_deliverable_service.add_comment(db, deliverable_id, current_user, payload.body)


@router.post(
    "/deliverables/{deliverable_id}/attachments",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_deliverable_attachment(
    deliverable_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    file: Annotated[UploadFile, File()],
) -> AttachmentResponse:
    data, content_type = await _validated_upload(file)
    try:
        return project_deliverable_service.add_attachment(
            db,
            deliverable_id,
            current_user,
            data=data,
            content_type=content_type,
            file_name=file.filename or "attachment",
        )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="We couldn't upload that attachment right now. Please try again.",
        ) from exc


@router.patch("/comments/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: UUID,
    payload: CommentCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> CommentResponse:
    comment = project_collaboration_service.update_comment(
        db, comment_id, current_user, payload.body
    )
    return project_collaboration_service.comment_response(comment, current_user.id)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    project_collaboration_service.delete_comment(db, comment_id, current_user)


@router.delete("/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(
    attachment_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    project_collaboration_service.delete_attachment(db, attachment_id, current_user)
