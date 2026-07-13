from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.notification import NotifType


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    type: NotifType
    title: str
    body: str
    tab: str
    action_label: str
    # Populated manually from the ORM's read_at field
    read: bool
    created_at: datetime


class NotificationListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[NotificationResponse]
