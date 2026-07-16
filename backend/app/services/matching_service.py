from __future__ import annotations

from sqlalchemy.orm import Session

from app.repositories import matching as matching_repository
from app.schemas.matching import (
    BlueprintMatchesResponse,
    MatchedDeveloperResponse,
    MatchListResponse,
    RoleMatchResponse,
)
from app.services import embeddings_client

SKILL_WEIGHT = 0.6
EXPERIENCE_WEIGHT = 0.25
AVAILABILITY_WEIGHT = 0.15
EXPERIENCE_CAP_YEARS = 8

RULE_SCORE_WEIGHT = 0.5
SEMANTIC_SCORE_WEIGHT = 0.5


def _score_developer(
    developer_skills: list[str],
    required_skills: list[str],
    experience_years: int | None,
    available: bool,
) -> int:
    normalized_dev_skills = {skill.strip().lower() for skill in developer_skills}
    normalized_required = {skill.strip().lower() for skill in required_skills}

    overlap = 0.0
    if normalized_required:
        overlap = len(normalized_dev_skills & normalized_required) / len(normalized_required)

    experience_score = min((experience_years or 0) / EXPERIENCE_CAP_YEARS, 1.0)
    availability_score = 1.0 if available else 0.6

    weighted = (
        SKILL_WEIGHT * overlap
        + EXPERIENCE_WEIGHT * experience_score
        + AVAILABILITY_WEIGHT * availability_score
    )
    return round(weighted * 100)


def _build_match(
    user, profile, match_score: int, semantic_score: int | None = None
) -> MatchedDeveloperResponse:
    return MatchedDeveloperResponse(
        user_id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        avatar_url=user.avatar_url,
        job_title=profile.job_title,
        skills=profile.skills,
        experience_years=profile.experience_years,
        availability=profile.availability,
        open_to_remote=profile.open_to_remote,
        rating_avg=float(profile.rating_avg or 0),
        match_score=match_score,
        semantic_score=semantic_score,
    )


def _score_all(
    developers, required_skills: list[str], min_experience: int
) -> list[MatchedDeveloperResponse]:
    scored: list[MatchedDeveloperResponse] = []
    for user in developers:
        profile = user.developer_profile
        if profile is None or (profile.experience_years or 0) < min_experience:
            continue
        score = _score_developer(
            profile.skills, required_skills, profile.experience_years, profile.availability
        )
        scored.append(_build_match(user, profile, score))
    scored.sort(key=lambda item: item.match_score, reverse=True)
    return scored


def get_matches(
    db: Session,
    *,
    required_skills: list[str],
    min_experience: int = 0,
    limit: int = 10,
) -> MatchListResponse:
    developers = matching_repository.list_available_developers(db)
    scored = _score_all(developers, required_skills, min_experience)
    return MatchListResponse(total=len(scored), items=scored[:limit])


def get_matches_for_blueprint_roles(
    db: Session,
    *,
    blueprint_id,
    blueprint_name: str | None,
    roles: list[dict],
    min_experience: int = 0,
    limit: int = 10,
) -> BlueprintMatchesResponse:
    developers = matching_repository.list_available_developers(db)

    role_matches: list[RoleMatchResponse] = []
    for role in roles:
        if not isinstance(role, dict):
            continue
        title = str(role.get("title") or role.get("role_title") or "Unspecified Role")
        skills = [str(skill).strip() for skill in role.get("skills", []) if str(skill).strip()]
        scored = _score_all(developers, skills, min_experience)
        role_matches.append(
            RoleMatchResponse(
                role_title=title,
                required_skills=skills,
                total_matches=len(scored),
                matches=scored[:limit],
            )
        )

    return BlueprintMatchesResponse(
        blueprint_id=blueprint_id,
        blueprint_name=blueprint_name,
        total_roles=len(role_matches),
        roles=role_matches,
    )


def _semantic_similarity(developer_skills: list[str], role_description: str) -> float:
    if not embeddings_client.embeddings_enabled() or not role_description.strip():
        return 0.0
    if not developer_skills:
        return 0.0

    role_vector = embeddings_client.embed_text(role_description)
    skills_vector = embeddings_client.embed_text(", ".join(developer_skills))
    similarity = embeddings_client.cosine_similarity(role_vector, skills_vector)
    return max(0.0, min(similarity, 1.0))


def get_matches_semantic(
    db: Session,
    *,
    required_skills: list[str],
    role_description: str,
    min_experience: int = 0,
    limit: int = 10,
) -> MatchListResponse:
    developers = matching_repository.list_available_developers(db)
    semantic_active = embeddings_client.embeddings_enabled() and bool(role_description.strip())

    scored: list[MatchedDeveloperResponse] = []
    for user in developers:
        profile = user.developer_profile
        if profile is None or (profile.experience_years or 0) < min_experience:
            continue

        rule_score = _score_developer(
            profile.skills, required_skills, profile.experience_years, profile.availability
        )
        similarity = _semantic_similarity(profile.skills, role_description)

        if semantic_active:
            combined_score = round(
                RULE_SCORE_WEIGHT * rule_score + SEMANTIC_SCORE_WEIGHT * (similarity * 100)
            )
            semantic_score = round(similarity * 100)
        else:
            combined_score = rule_score
            semantic_score = None

        scored.append(_build_match(user, profile, combined_score, semantic_score))

    scored.sort(key=lambda item: item.match_score, reverse=True)
    return MatchListResponse(total=len(scored), items=scored[:limit])
