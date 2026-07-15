from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MatchedDeveloperResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    user_id: UUID
    first_name: str
    last_name: str
    avatar_url: str | None = None
    job_title: str | None = None
    skills: list[str]
    experience_years: int | None = None
    availability: bool
    open_to_remote: bool
    rating_avg: float
    match_score: int
    semantic_score: int | None = None


class MatchListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    items: list[MatchedDeveloperResponse]


class RoleMatchResponse(BaseModel):
    """Ranked developer matches for a single role from a blueprint's roles[]."""

    model_config = ConfigDict(extra="forbid")

    role_title: str
    required_skills: list[str]
    total_matches: int
    matches: list[MatchedDeveloperResponse]


class BlueprintMatchesResponse(BaseModel):
    """Response for GET /blueprints/{blueprint_id}/matches.

    `roles` is empty (not an error) whenever the blueprint has no version yet,
    or its version's content_json / roles[] hasn't been populated by the
    Generation pipeline yet -- so the frontend never breaks while that
    track is still landing.
    """

    model_config = ConfigDict(extra="forbid")

    blueprint_id: UUID
    blueprint_name: str | None
    total_roles: int
    roles: list[RoleMatchResponse]
