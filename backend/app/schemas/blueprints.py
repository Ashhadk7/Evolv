from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class BlueprintVisibility(str, Enum):
    PRIVATE = "private"
    PUBLIC = "public"


class VersionState(str, Enum):
    CURRENT = "current"
    PENDING = "pending"


class LevelRating(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class BlueprintVersionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    industry: str = Field(min_length=1, max_length=255)
    idea_desc: str = Field(min_length=1)
    differentiator: str | None = None
    ai_recommend: str | None = None
    viability: int = Field(ge=0, le=100)
    market_potential: int = Field(ge=0, le=100)
    funding_readiness: LevelRating
    developer_demand: LevelRating
    content_json: dict[str, Any] | None = None

    @field_validator(
        "name", "industry", "idea_desc", "differentiator", "ai_recommend", mode="before"
    )
    @classmethod
    def strip_text(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value


class BlueprintVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    blueprint_id: UUID
    state: VersionState
    name: str
    industry: str
    idea_desc: str
    differentiator: str | None = None
    ai_recommend: str | None = None
    viability: int
    market_potential: int
    funding_readiness: LevelRating
    developer_demand: LevelRating
    generated_at: datetime
    content_json: dict[str, Any] | None = None

    @field_validator("state", "funding_readiness", "developer_demand", mode="before")
    @classmethod
    def normalize_enum(cls, value: Any) -> Any:
        if isinstance(value, Enum):
            return value.value
        return value


class BlueprintCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    visibility: BlueprintVisibility = BlueprintVisibility.PRIVATE
    initial_version: BlueprintVersionCreate


class BlueprintUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    visibility: BlueprintVisibility


class BlueprintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    founder_id: UUID
    visibility: BlueprintVisibility
    created_at: datetime
    updated_at: datetime
    current_version: BlueprintVersionResponse | None = None
    pending_version: BlueprintVersionResponse | None = None

    @field_validator("visibility", mode="before")
    @classmethod
    def normalize_visibility(cls, value: Any) -> Any:
        if isinstance(value, Enum):
            return value.value
        return value


class BlueprintListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[BlueprintResponse]
