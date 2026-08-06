from uuid import UUID

from fastapi import APIRouter, BackgroundTasks

from app.api.deps import CurrentDeveloper, DbSession
from app.schemas.projects import (
    DeveloperInviteListResponse,
    DeveloperProjectDetail,
    DeveloperProjectListResponse,
    ProjectMemberNegotiate,
    ProjectMemberResponse,
)
from app.services import developer_project_service, project_membership_service

router = APIRouter()


@router.get("", response_model=DeveloperProjectListResponse)
def list_developer_projects(
    db: DbSession,
    current_user: CurrentDeveloper,
) -> DeveloperProjectListResponse:
    items = developer_project_service.list_projects(db, current_user)
    return DeveloperProjectListResponse(total=len(items), items=items)


@router.get("/invites", response_model=DeveloperInviteListResponse)
def list_developer_invites(
    db: DbSession,
    current_user: CurrentDeveloper,
) -> DeveloperInviteListResponse:
    items = project_membership_service.list_invites(db, current_user)
    return DeveloperInviteListResponse(total=len(items), items=items)


@router.post("/invites/{member_id}/accept", response_model=ProjectMemberResponse)
def accept_developer_invite(
    member_id: UUID,
    db: DbSession,
    current_user: CurrentDeveloper,
    background_tasks: BackgroundTasks,
) -> ProjectMemberResponse:
    return project_membership_service.respond_to_invite(
        db, member_id, current_user, accept=True, background_tasks=background_tasks
    )


@router.post("/invites/{member_id}/decline", response_model=ProjectMemberResponse)
def decline_developer_invite(
    member_id: UUID,
    db: DbSession,
    current_user: CurrentDeveloper,
    background_tasks: BackgroundTasks,
) -> ProjectMemberResponse:
    return project_membership_service.respond_to_invite(
        db, member_id, current_user, accept=False, background_tasks=background_tasks
    )


@router.post("/invites/{member_id}/negotiate", response_model=ProjectMemberResponse)
def negotiate_developer_invite(
    member_id: UUID,
    payload: ProjectMemberNegotiate,
    db: DbSession,
    current_user: CurrentDeveloper,
    background_tasks: BackgroundTasks,
) -> ProjectMemberResponse:
    return project_membership_service.propose_counter(
        db,
        member_id,
        current_user,
        amount_cents=payload.amount_cents,
        background_tasks=background_tasks,
    )


@router.get("/{project_id}", response_model=DeveloperProjectDetail)
def get_developer_project(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentDeveloper,
) -> DeveloperProjectDetail:
    return developer_project_service.get_project(db, project_id, current_user)
