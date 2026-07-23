from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.user import User, UserRole
from app.repositories import blueprints as blueprints_repository
from app.repositories import developer_profiles as developer_profiles_repository
from app.repositories import projects as projects_repository
from app.schemas.projects import (
    ProjectCreate,
    ProjectDeveloperAssign,
    ProjectMilestonesUpdate,
    ProjectStatusUpdate,
)
from app.services.exceptions import (
    BlueprintNotFoundError,
    FounderProfileRequiredError,
    ProjectAccessDeniedError,
    ProjectInvalidAssignmentError,
    ProjectNotFoundError,
    ProjectPersistenceError,
)


# ── Milestone assignment validation ────────────────────────────────────────────


def _extract_assigned_developer_ids(milestones: list[dict[str, Any]]) -> set[UUID]:
    """Walk the opaque milestones document and collect every assignment.developerId.

    Milestones are stored as an opaque JSONB document mirroring the frontend's
    ProjectState (a list of entries whose "value" may contain "phaseStates",
    each phase optionally holding an "assignment.developerId"). We only need to
    find developerId values wherever they appear; we don't enforce the rest of
    the shape.
    """
    found: set[UUID] = set()

    def _walk(node: Any) -> None:
        if isinstance(node, dict):
            assignment = node.get("assignment")
            if isinstance(assignment, dict):
                dev_id = assignment.get("developerId")
                if dev_id:
                    try:
                        found.add(UUID(str(dev_id)))
                    except ValueError:
                        pass
            for value in node.values():
                _walk(value)
        elif isinstance(node, list):
            for item in node:
                _walk(item)

    _walk(milestones)
    return found


def _validate_milestone_assignments(db: Session, milestones: list[dict[str, Any]]) -> None:
    """Ensure every developerId referenced in milestones is a real developer."""
    referenced_ids = _extract_assigned_developer_ids(milestones)
    if not referenced_ids:
        return
    existing_ids = developer_profiles_repository.get_existing_developer_ids(db, referenced_ids)
    missing_ids = referenced_ids - existing_ids
    if missing_ids:
        raise ProjectInvalidAssignmentError(
            "One or more assigned developers do not exist: "
            + ", ".join(str(dev_id) for dev_id in sorted(missing_ids, key=str))
        )


# ── Guards ────────────────────────────────────────────────────────────────────


def _require_founder_profile(user: User) -> UUID:
    """Return the founder's user_id or raise if the user cannot own projects."""
    if user.role != UserRole.FOUNDER or user.founder_profile is None:
        raise FounderProfileRequiredError(
            "Only founders with a founder profile can manage projects."
        )
    return user.founder_profile.user_id


def _assert_project_owner(project: Project, founder_id: UUID) -> None:
    """Raise if the current founder does not own this project."""
    if project.founder_id != founder_id:
        raise ProjectAccessDeniedError()


# ── Read ──────────────────────────────────────────────────────────────────────


def list_projects(
    db: Session, current_user: User, *, limit: int, offset: int
) -> tuple[list[Project], int]:
    founder_id = _require_founder_profile(current_user)
    return projects_repository.list_projects_for_founder(
        db, founder_id, limit=limit, offset=offset
    )


def get_project(db: Session, project_id: UUID, current_user: User) -> Project:
    founder_id = _require_founder_profile(current_user)
    project = projects_repository.get_project_by_id(db, project_id)
    if project is None:
        raise ProjectNotFoundError()
    _assert_project_owner(project, founder_id)
    return project


# ── Write ─────────────────────────────────────────────────────────────────────


def create_project(
    db: Session, current_user: User, payload: ProjectCreate
) -> Project:
    founder_id = _require_founder_profile(current_user)

    blueprint = blueprints_repository.get_blueprint_by_id(db, payload.blueprint_id)
    if blueprint is None:
        raise BlueprintNotFoundError()
    # Founders can only start projects from blueprints they own.
    if blueprint.founder_id != founder_id:
        raise ProjectAccessDeniedError(
            "You can only create a project from your own blueprint."
        )

    # Fast path: a project for this blueprint already exists (e.g. a retried
    # request, a duplicate "Start Project" click that reached the server
    # twice, or a refresh racing an in-flight create). Creation is idempotent
    # per blueprint — return what's already there instead of erroring or
    # inserting a second row.
    existing = projects_repository.get_project_by_blueprint_id(db, payload.blueprint_id)
    if existing is not None:
        _assert_project_owner(existing, founder_id)
        return existing

    try:
        project = projects_repository.create_project(
            db,
            blueprint_id=payload.blueprint_id,
            founder_id=founder_id,
            title=payload.title,
            milestones=payload.milestones,
        )
        db.commit()
        db.refresh(project)
    except IntegrityError:
        # Two concurrent requests both passed the check above before either
        # committed. The DB's unique constraint on blueprint_id is the real
        # guard here — on conflict, roll back and return the row the other
        # request created instead of surfacing a duplicate-key error.
        db.rollback()
        winner = projects_repository.get_project_by_blueprint_id(db, payload.blueprint_id)
        if winner is None:
            # Shouldn't happen, but don't swallow a genuine persistence issue.
            raise ProjectPersistenceError("Project could not be created.")
        _assert_project_owner(winner, founder_id)
        return winner
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError("Project could not be created.") from exc

    return project


def update_project_status(
    db: Session, project_id: UUID, current_user: User, payload: ProjectStatusUpdate
) -> Project:
    founder_id = _require_founder_profile(current_user)
    project = projects_repository.get_project_by_id(db, project_id)
    if project is None:
        raise ProjectNotFoundError()
    _assert_project_owner(project, founder_id)

    try:
        projects_repository.update_project_status(db, project, payload.status)
        db.commit()
        db.refresh(project)
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError("Project status could not be updated.") from exc

    return project


def update_project_milestones(
    db: Session, project_id: UUID, current_user: User, payload: ProjectMilestonesUpdate
) -> Project:
    founder_id = _require_founder_profile(current_user)
    project = projects_repository.get_project_by_id(db, project_id)
    if project is None:
        raise ProjectNotFoundError()
    _assert_project_owner(project, founder_id)

    _validate_milestone_assignments(db, payload.milestones)

    try:
        projects_repository.update_project_milestones(db, project, payload.milestones)
        db.commit()
        db.refresh(project)
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError("Project milestones could not be updated.") from exc

    return project


def assign_developer_to_project(
    db: Session, project_id: UUID, current_user: User, payload: ProjectDeveloperAssign
) -> Project:
    """Assign or unassign a developer from a project (founder-only)."""
    founder_id = _require_founder_profile(current_user)
    project = projects_repository.get_project_by_id(db, project_id)
    if project is None:
        raise ProjectNotFoundError()
    _assert_project_owner(project, founder_id)

    try:
        projects_repository.assign_developer(db, project, payload.developer_id)
        db.commit()
        db.refresh(project)
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError("Developer assignment could not be saved.") from exc

    return project
