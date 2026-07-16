from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.blueprint import BlueprintVisibility, LevelRating, VersionState


class BlueprintVersionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=255)
    industry: str = Field(min_length=1, max_length=255)
    idea_desc: str = Field(min_length=1)
    differentiator: str = Field(min_length=1)
    ai_recommend: str = Field(min_length=1)
    viability: int = Field(ge=0, le=100)
    market_potential: int = Field(ge=0, le=100)
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
    differentiator: str | None
    ai_recommend: str | None
    viability: int
    market_potential: int
    developer_demand: LevelRating
    content_json: dict[str, Any] | None = None
    generated_at: datetime


class BlueprintCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    visibility: BlueprintVisibility = BlueprintVisibility.PRIVATE
    initial_version: BlueprintVersionCreate


class BlueprintGenerateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    idea: str = Field(min_length=20, max_length=2500)
    industry: str = Field(min_length=1, max_length=255)
    target_customer: str = Field(default="", max_length=500)
    problem: str = Field(default="", max_length=800)
    solution: str = Field(default="", max_length=800)
    stage: str = Field(default="", max_length=120)
    budget: str = Field(default="", max_length=80)
    timeline: str = Field(default="", max_length=120)
    region: str = Field(default="", max_length=120)
    monetization: str = Field(default="", max_length=500)
    constraints: str = Field(default="", max_length=800)
    visibility: BlueprintVisibility = BlueprintVisibility.PRIVATE


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
    current_version: BlueprintVersionResponse | None


class BlueprintListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[BlueprintResponse]
