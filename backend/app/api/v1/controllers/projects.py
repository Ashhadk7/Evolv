from uuid import UUID

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentFounder, DbSession
from app.schemas.projects import (
    ProjectCreate,
    ProjectDeveloperAssign,
    ProjectListResponse,
    ProjectMilestonesUpdate,
    ProjectResponse,
    ProjectStatusUpdate,
)
from app.services import project_service

router = APIRouter()


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
        items=[ProjectResponse.model_validate(p) for p in items],
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectResponse:
    project = project_service.create_project(db, current_user, payload)
    return ProjectResponse.model_validate(project)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: UUID,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectResponse:
    project = project_service.get_project(db, project_id, current_user)
    return ProjectResponse.model_validate(project)


@router.patch("/{project_id}/status", response_model=ProjectResponse)
def update_project_status(
    project_id: UUID,
    payload: ProjectStatusUpdate,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectResponse:
    project = project_service.update_project_status(db, project_id, current_user, payload)
    return ProjectResponse.model_validate(project)


@router.put("/{project_id}/milestones", response_model=ProjectResponse)
def update_project_milestones(
    project_id: UUID,
    payload: ProjectMilestonesUpdate,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectResponse:
    project = project_service.update_project_milestones(db, project_id, current_user, payload)
    return ProjectResponse.model_validate(project)


@router.patch("/{project_id}/developer", response_model=ProjectResponse)
def assign_project_developer(
    project_id: UUID,
    payload: ProjectDeveloperAssign,
    db: DbSession,
    current_user: CurrentFounder,
) -> ProjectResponse:
    project = project_service.assign_developer_to_project(db, project_id, current_user, payload)
    return ProjectResponse.model_validate(project)
