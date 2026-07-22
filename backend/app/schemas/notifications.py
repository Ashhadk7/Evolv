from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.notification import NotifType
from app.services.notification_preferences import DEFAULT_NOTIFICATION_PREFERENCES


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


class NotificationPreferencesResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    preferences: dict[str, bool]


class NotificationPreferencesUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    preferences: dict[str, bool]

    @field_validator("preferences")
    @classmethod
    def validate_preferences(cls, value: dict[str, bool]) -> dict[str, bool]:
        unknown = set(value) - set(DEFAULT_NOTIFICATION_PREFERENCES)
        if unknown:
            keys = ", ".join(sorted(unknown))
            raise ValueError(f"Unknown notification preference: {keys}")
        return value
