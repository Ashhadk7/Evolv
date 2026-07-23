from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ApplicationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    blueprint_id: UUID


class ApplicationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connection_id: UUID | None = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    developer_id: UUID
    blueprint_id: UUID
    connection_id: UUID | None = None
    applied_at: datetime


class ApplicationListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[ApplicationResponse]


class SavedBlueprintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    developer_id: UUID
    blueprint_id: UUID
    saved_at: datetime


class DeveloperSummary(BaseModel):
    """Lightweight developer snapshot embedded in founder-facing application lists."""

    model_config = ConfigDict(from_attributes=True, extra="forbid")

    user_id: UUID
    job_title: str | None = None
    skills: list[str] = Field(default_factory=list)
    rating_avg: float = 0.0
    availability: bool = True


class BlueprintApplicationResponse(BaseModel):
    """Application record enriched with developer summary — for founder views."""

    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    developer_id: UUID
    blueprint_id: UUID
    connection_id: UUID | None = None
    applied_at: datetime
    developer: DeveloperSummary


class BlueprintApplicationListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[BlueprintApplicationResponse]
