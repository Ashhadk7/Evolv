from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DiscoverBlueprintRole(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: str
    count: int
    skills: list[str]
    lead: bool


class DiscoverRoleFit(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: str
    fit: int


class DiscoverApplicantsByRole(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: str
    count: int


class DiscoverFilterOptions(BaseModel):
    model_config = ConfigDict(extra="forbid")

    industries: list[str]
    stages: list[str]
    tech_stack: list[str]
    roles: list[str]


class DiscoverBlueprintResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    name: str
    industry: str
    founder_id: UUID
    founder_name: str | None = None
    founder_blueprint_count: int = 0
    stage: str
    summary: str
    viability: int
    tech_stack: list[str]
    roles: list[DiscoverBlueprintRole]
    match_score: int | None = None
    fit_label: str | None = None
    best_role: str | None = None
    role_fits: list[DiscoverRoleFit] = Field(default_factory=list)
    match_reasons: list[str] = Field(default_factory=list)
    matched_skills: list[str] = Field(default_factory=list)
    skills_to_pick_up: list[str] = Field(default_factory=list)
    applicant_count: int = 0
    applicants_by_role: list[DiscoverApplicantsByRole] = Field(default_factory=list)
    saved: bool
    applied: bool
    application_id: UUID | None = None
    application_status: str | None = None
    applied_role: str | None = None
    applied_at: datetime | None = None
    withdrawn_at: datetime | None = None
    created_at: datetime
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
