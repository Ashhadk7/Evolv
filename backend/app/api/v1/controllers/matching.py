from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, DbSession
from app.schemas.matching import BlueprintMatchesResponse, MatchListResponse
from app.services import blueprint_service, matching_service

router = APIRouter()

SkillsFilter = Annotated[
    str, Query(min_length=1, description="Comma-separated skills, e.g. Python,FastAPI")
]
MinExperienceFilter = Annotated[int, Query(ge=0, le=80)]
LimitFilter = Annotated[int, Query(ge=1, le=100)]
RoleDescriptionFilter = Annotated[
    str,
    Query(
        min_length=1,
        description="Free-text role description, e.g. 'Backend engineer building FastAPI "
        "services with Postgres and async workers'",
    ),
]


@router.get("/matching", response_model=MatchListResponse)
def match_developers(
    db: DbSession,
    current_user: CurrentUser,
    skills: SkillsFilter,
    min_experience: MinExperienceFilter = 0,
    limit: LimitFilter = 10,
) -> MatchListResponse:
    required_skills = [skill.strip() for skill in skills.split(",") if skill.strip()]
    return matching_service.get_matches(
        db,
        required_skills=required_skills,
        min_experience=min_experience,
        limit=limit,
    )


@router.get("/matching/semantic", response_model=MatchListResponse)
def match_developers_semantic(
    db: DbSession,
    current_user: CurrentUser,
    skills: SkillsFilter,
    role_description: RoleDescriptionFilter,
    min_experience: MinExperienceFilter = 0,
    limit: LimitFilter = 10,
) -> MatchListResponse:
    required_skills = [skill.strip() for skill in skills.split(",") if skill.strip()]
    return matching_service.get_matches_semantic(
        db,
        required_skills=required_skills,
        role_description=role_description,
        min_experience=min_experience,
        limit=limit,
    )


@router.get("/blueprints/{blueprint_id}/matches", response_model=BlueprintMatchesResponse)
def match_developers_for_blueprint(
    blueprint_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    min_experience: MinExperienceFilter = 0,
    limit: LimitFilter = 10,
) -> BlueprintMatchesResponse:
    blueprint = blueprint_service.get_blueprint(
        db, blueprint_id, current_user, require_ownership=False
    )
    version = blueprint.current_version or blueprint.pending_version
    content = version.content_json if version is not None else None
    roles = content.get("roles", []) if isinstance(content, dict) else []

    return matching_service.get_matches_for_blueprint_roles(
        db,
        blueprint_id=blueprint.id,
        blueprint_name=version.name if version is not None else None,
        roles=roles,
        min_experience=min_experience,
        limit=limit,
    )
