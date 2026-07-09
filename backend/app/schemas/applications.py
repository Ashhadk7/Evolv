from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


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
