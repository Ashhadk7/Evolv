"""Shared project authorization and display helpers.

Every project-scoped service (issues, deadlines, deliverables, comments) needs
the same answer to "can this user see this project, and as which role" — that
check lives here once instead of being re-derived per service.
"""

from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.project import Project, ProjectMemberStatus
from app.models.user import User, UserRole
from app.repositories import projects as projects_repository
from app.services.exceptions import ProjectAccessDeniedError, ProjectNotFoundError


@dataclass(frozen=True)
class Access:
    project: Project
    user: User
    is_founder: bool
    member_phases: frozenset[int]

    @property
    def user_id(self) -> UUID:
        return self.user.id


def require_access(db: Session, project_id: UUID, user: User) -> Access:
    project = projects_repository.get_project_by_id(db, project_id)
    if project is None:
        raise ProjectNotFoundError()

    if user.role == UserRole.FOUNDER and user.founder_profile is not None:
        if project.founder_id != user.founder_profile.user_id:
            raise ProjectAccessDeniedError()
        return Access(project, user, True, frozenset())

    if user.role == UserRole.DEVELOPER and user.developer_profile is not None:
        memberships = projects_repository.list_memberships_on_project(
            db, project_id, user.developer_profile.user_id
        )
        phases = {
            m.phase_index for m in memberships if m.status == ProjectMemberStatus.ACCEPTED
        }
        if phases:
            return Access(project, user, False, frozenset(phases))

    raise ProjectAccessDeniedError("You do not have access to this project.")


def display_name(user: User | None) -> str:
    if user is None:
        return "Unknown"
    name = f"{user.first_name} {user.last_name}".strip()
    return name or user.email


def initials(name: str) -> str:
    parts = [part for part in name.split() if part]
    if not parts:
        return "?"
    last = parts[-1][0] if len(parts) > 1 else ""
    return f"{parts[0][0]}{last}".upper()
