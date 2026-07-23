from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.project import Project, ProjectStatus


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
