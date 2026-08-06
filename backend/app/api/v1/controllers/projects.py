from collections.abc import Sequence
from uuid import UUID

from fastapi import APIRouter, Query, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentFounder, DbSession
from app.models.project import Project
from app.repositories import projects as projects_repository
from app.schemas.projects import (
    ProjectCreate,
    ProjectDeveloperAssign,
    ProjectListResponse,
    ProjectMemberInvite,
    ProjectMemberListResponse,
    ProjectMemberRemove,
    ProjectMemberResponse,
    ProjectMilestonesUpdate,
    ProjectPaymentRecord,
    ProjectResponse,
    ProjectStatusUpdate,
)
from app.services import project_membership_service, project_service

router = APIRouter()


def _assemble(db: Session, projects: Sequence[Project]) -> list[ProjectResponse]:
    """Attach the fields a Project row cannot supply on its own.

    `members` needs a user lookup and a payments sum per member;
    `deliverables_done`/`deliverables_total` need a deliverables tally. Batched
    over the whole list so a longer page does not mean more round trips.
    """
    project_ids = [project.id for project in projects]
    members = project_membership_service.members_by_project(db, project_ids)
    deliverable_counts = projects_repository.count_deliverables_by_project(db, project_ids)
    return [
        ProjectResponse.model_validate(project).model_copy(
            update={
                "members": members.get(project.id, []),
                "deliverables_done": deliverable_counts.get(project.id, (0, 0))[0],
                "deliverables_total": deliverable_counts.get(project.id, (0, 0))[1],
            }
        )
        for project in projects
    ]


def _assemble_one(db: Session, project: Project) -> ProjectResponse:
    """Single-project form of `_assemble`.

    Every endpoint returning a project goes through here; skipping it reports a
    project as having no members even when it has several.
    """
    return _assemble(db, [project])[0]


@router.get("", response_model=ProjectListResponse)
def list_projects(
    db: DbSession,
    current_user: CurrentFounder,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> ProjectListResponse:
    items, total = project_service.list_projects(db, current_user, limit=limit, offset=offset)
    return ProjectListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=_assemble(db, items),
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectResponse:
    project = project_service.create_project(db, current_user, payload)
    return _assemble_one(db, project)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectResponse:
    project = project_service.get_project(db, project_id, current_user)
    return _assemble_one(db, project)


@router.patch("/{project_id}/status", response_model=ProjectResponse)
def update_project_status(
    project_id: UUID,
    payload: ProjectStatusUpdate,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectResponse:
    project = project_service.update_project_status(db, project_id, current_user, payload)
    return _assemble_one(db, project)


@router.put("/{project_id}/milestones", response_model=ProjectResponse)
def update_project_milestones(
    project_id: UUID,
    payload: ProjectMilestonesUpdate,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectResponse:
    project = project_service.update_project_milestones(db, project_id, current_user, payload)
    return _assemble_one(db, project)


@router.get("/{project_id}/members", response_model=ProjectMemberListResponse)
def list_project_members(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectMemberListResponse:
    items = project_membership_service.list_members(db, project_id, current_user)
    return ProjectMemberListResponse(total=len(items), items=items)


@router.post(
    "/{project_id}/members",
    response_model=ProjectMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def invite_project_member(
    project_id: UUID,
    payload: ProjectMemberInvite,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectMemberResponse:
    return project_membership_service.invite_developer(db, project_id, current_user, payload)


@router.delete("/members/{member_id}", response_model=ProjectMemberResponse)
def revoke_project_invite(
    member_id: UUID,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectMemberResponse:
    return project_membership_service.revoke_invite(db, member_id, current_user)


@router.post("/members/{member_id}/remove", response_model=ProjectMemberResponse)
def remove_project_member(
    member_id: UUID,
    payload: ProjectMemberRemove,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectMemberResponse:
    return project_membership_service.remove_member(db, member_id, current_user, payload.reason)


@router.post("/members/{member_id}/payments", response_model=ProjectMemberResponse)
def record_member_payment(
    member_id: UUID,
    payload: ProjectPaymentRecord,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectMemberResponse:
    return project_membership_service.record_payment(db, member_id, current_user, payload)


@router.patch("/{project_id}/developer", response_model=ProjectResponse)
def assign_project_developer(
    project_id: UUID,
    payload: ProjectDeveloperAssign,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectResponse:
    project = project_service.assign_developer_to_project(db, project_id, current_user, payload)
    return _assemble_one(db, project)
