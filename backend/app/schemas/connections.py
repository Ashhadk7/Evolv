from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.connection import ConnectionStatus


class ConnectionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    receiver_id: UUID
    note: str | None = Field(default=None, max_length=500)


class ConnectionUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: ConnectionStatus


class ConnectionUserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: str
    last_name: str
    avatar_url: str | None = None
    role: str
    job_title: str | None = None
    company: str | None = None


class ConnectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: ConnectionStatus
    note: str | None = None
    created_at: datetime
    updated_at: datetime
    user: ConnectionUserSummary
