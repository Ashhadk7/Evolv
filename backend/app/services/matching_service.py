from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories import matching as matching_repository
from app.schemas.matching import (
    BlueprintMatchesResponse,
    MatchedDeveloperResponse,
    MatchListResponse,
    RoleMatchResponse,
)
from app.services import embeddings_service, pinecone_service

logger = logging.getLogger(__name__)

SKILL_WEIGHT = 0.6
EXPERIENCE_WEIGHT = 0.25
AVAILABILITY_WEIGHT = 0.15
EXPERIENCE_CAP_YEARS = 8

RULE_SCORE_WEIGHT = 0.5
SEMANTIC_SCORE_WEIGHT = 0.5


def _parse_role_skills(raw_skills: object) -> list[str]:
    """Blueprint roles store skills as a comma-separated string (e.g. 'React, Node.js, ...'),
    but tolerate a list too in case the generator output shape changes."""
    if isinstance(raw_skills, str):
        return [skill.strip() for skill in raw_skills.split(",") if skill.strip()]
    if isinstance(raw_skills, list):
        return [str(skill).strip() for skill in raw_skills if str(skill).strip()]
    return []


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


def _fallback_rule_based(
    db: Session, required_skills: list[str], min_experience: int, limit: int
) -> MatchListResponse:
    developers = matching_repository.list_available_developers(db)
    scored = _score_all(developers, required_skills, min_experience)
    return MatchListResponse(total=len(scored), items=scored[:limit])


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
        title = str(
            role.get("role") or role.get("title") or role.get("role_title") or "Unspecified Role"
        )
        skills = _parse_role_skills(role.get("skills"))
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


def get_matches_semantic(
    db: Session,
    *,
    required_skills: list[str],
    role_description: str,
    min_experience: int = 0,
    limit: int = 10,
) -> MatchListResponse:
    if not embeddings_service.embeddings_enabled() or not pinecone_service.index_ready():
        return _fallback_rule_based(db, required_skills, min_experience, limit)

    query_text = f"{role_description} skills: {', '.join(required_skills)}"
    try:
        query_embedding = embeddings_service.embed_text(query_text)
        if not query_embedding:
            return _fallback_rule_based(db, required_skills, min_experience, limit)

        top_matches = pinecone_service.query_top_k(query_embedding, top_k=limit)
    except Exception:
        logger.exception("Semantic matching failed, falling back to rule-based matching")
        return _fallback_rule_based(db, required_skills, min_experience, limit)

    if not top_matches:
        return MatchListResponse(total=0, items=[])

    developers_by_id = {
        str(user.id): user
        for user in matching_repository.get_developers_by_ids(
            db, [developer_id for developer_id, _ in top_matches]
        )
    }

    scored: list[MatchedDeveloperResponse] = []
    for developer_id, similarity in top_matches:
        user = developers_by_id.get(developer_id)
        profile = user.developer_profile if user else None
        if profile is None or (profile.experience_years or 0) < min_experience:
            continue

        rule_score = _score_developer(
            profile.skills, required_skills, profile.experience_years, profile.availability
        )
        semantic_score = round(similarity * 100)
        combined_score = round(
            RULE_SCORE_WEIGHT * rule_score + SEMANTIC_SCORE_WEIGHT * semantic_score
        )
        scored.append(_build_match(user, profile, combined_score, semantic_score))

    scored.sort(key=lambda item: item.match_score, reverse=True)
    return MatchListResponse(total=len(scored), items=scored[:limit])


def sync_developer_embedding(user_id: UUID, skills: list[str]) -> None:
    if not skills:
        return
    try:
        embedding = embeddings_service.embed_text(", ".join(skills))
        if embedding:
            pinecone_service.upsert_developer(str(user_id), embedding)
    except Exception:
        logger.exception("Failed to sync developer embedding for user %s", user_id)


def remove_developer_embedding(user_id: UUID) -> None:
    try:
        pinecone_service.delete_developer(str(user_id))
    except Exception:
        logger.exception("Failed to remove developer embedding for user %s", user_id)


def reindex_developer_embeddings(db: Session) -> int:
    developers = matching_repository.list_available_developers(db)
    indexed = 0
    for user in developers:
        profile = user.developer_profile
        if profile is None or not profile.skills:
            continue
        embedding = embeddings_service.embed_text(", ".join(profile.skills))
        if not embedding:
            continue
        pinecone_service.upsert_developer(str(user.id), embedding)
        indexed += 1
    return indexed
