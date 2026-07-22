from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.blueprint import LevelRating


class DiscoverBlueprintRole(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: str
    count: int
    skills: list[str]
    lead: bool


class DiscoverFilterOptions(BaseModel):
    model_config = ConfigDict(extra="forbid")

    industries: list[str]
    stages: list[str]
    tech_stack: list[str]


class DiscoverBlueprintResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    name: str
    industry: str
    founder_id: UUID
    founder_name: str | None = None
    stage: str
    summary: str
    differentiator: str | None = None
    viability: int
    developer_demand: LevelRating
    tech_stack: list[str]
    roles: list[DiscoverBlueprintRole]
    mvp_features: list[str]
    timeline: str | None = None
    match_score: int
    match_reasons: list[str]
    matched_skills: list[str]
    saved: bool
    applied: bool
    application_id: UUID | None = None
    application_status: str | None = None
    applied_role: str | None = None
    applied_at: datetime | None = None
    withdrawn_at: datetime | None = None
    updated_at: datetime


class DiscoverBlueprintListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    saved_count: int
    applications_count: int
    high_match_count: int
    filter_options: DiscoverFilterOptions
    items: list[DiscoverBlueprintResponse]


class SavedDiscoverBlueprintItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    name: str
    available: bool
    saved_at: datetime
    blueprint: DiscoverBlueprintResponse | None = None


class SavedDiscoverBlueprintListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    items: list[SavedDiscoverBlueprintItem]
