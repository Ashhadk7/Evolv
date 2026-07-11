from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DeveloperReviewCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1, max_length=2000)

    @field_validator("comment")
    @classmethod
    def strip_comment(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Review comment is required.")
        return stripped


class DeveloperReviewResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    developer_user_id: UUID
    reviewer_user_id: UUID
    reviewer_name: str
    rating: int
    comment: str
    created_at: datetime
    updated_at: datetime
