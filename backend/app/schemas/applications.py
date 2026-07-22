from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ApplicationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    blueprint_id: UUID
    role: str | None = Field(default=None, max_length=255)

    @field_validator("role")
    @classmethod
    def strip_role(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class ApplicationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connection_id: UUID | None = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    developer_id: UUID
    blueprint_id: UUID
    connection_id: UUID | None = None
    role: str | None = None
    status: str
    applied_at: datetime
    withdrawn_at: datetime | None = None


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
