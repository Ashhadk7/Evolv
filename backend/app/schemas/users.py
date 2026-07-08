from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.schemas.auth import SignupRole


class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    role: SignupRole
    first_name: str
    last_name: str
    country: str | None = None
    country_code: str | None = None
    city: str | None = None
    avatar_url: str | None = None
    phone_verified: bool
    created_at: datetime

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, value: Any) -> Any:
        if isinstance(value, Enum):
            return value.value
        return value


class UserListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[UserSummary]
