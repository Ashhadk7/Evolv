from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.project import ProjectStatus


class MilestoneItem(BaseModel):
    """A single phase/milestone entry.

    The shape mirrors the frontend's ``ProjectPhaseState`` type so that the
    client can round-trip its local state through the API without transformation.
    The backend stores it as-is inside the ``milestones`` JSONB column.
    """

    model_config = ConfigDict(extra="allow")

    phase: str
    status: str = "Not Started"


class ProjectCreate(BaseModel):
    """Payload to kick off a new project from an existing blueprint."""

    model_config = ConfigDict(extra="forbid")

    blueprint_id: UUID
    title: str = Field(min_length=1, max_length=255)
    milestones: list[dict[str, Any]] | None = None


class ProjectStatusUpdate(BaseModel):
    """Payload to transition a project's lifecycle status."""

    model_config = ConfigDict(extra="forbid")

    status: ProjectStatus


class ProjectMilestonesUpdate(BaseModel):
    """Payload to replace the milestones array in full."""

    model_config = ConfigDict(extra="forbid")

    milestones: list[dict[str, Any]]


class ProjectDeveloperAssign(BaseModel):
    """Payload to assign or unassign a developer from a project.

    Set developer_id to null to unassign.
    """

    model_config = ConfigDict(extra="forbid")

    developer_id: UUID | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    blueprint_id: UUID
    founder_id: UUID
    developer_id: UUID | None = None
    status: ProjectStatus
    title: str
    milestones: list[dict[str, Any]] | None = None
    created_at: datetime
    updated_at: datetime


class ProjectListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[ProjectResponse]
