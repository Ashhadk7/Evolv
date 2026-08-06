from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import DeveloperProfile
from app.repositories import matching as matching_repository
from app.schemas.matching import (
    BlueprintMatchesResponse,
    MatchedDeveloperResponse,
    MatchListResponse,
    RoleMatchResponse,
)
from app.services import embeddings_service, pinecone_service
from app.services.developer_rates import median_weekly_usd, rate_of
from app.services.profile_quality import is_developer_profile_matchable

logger = logging.getLogger(__name__)

SKILL_WEIGHT = 0.6
EXPERIENCE_WEIGHT = 0.25
AVAILABILITY_WEIGHT = 0.15
EXPERIENCE_CAP_YEARS = 8

RULE_SCORE_WEIGHT = 0.5
SEMANTIC_SCORE_WEIGHT = 0.5


def parse_role_skills(raw_skills: object) -> list[str]:
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
        rate=rate_of(profile),
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
        if not is_developer_profile_matchable(profile):
            continue
        score = _score_developer(
            profile.skills, required_skills, profile.experience_years, profile.availability
        )
        scored.append(_build_match(user, profile, score))
    scored.sort(key=lambda item: item.match_score, reverse=True)
    return scored


RATE_SAMPLE_LIMIT = 10


def rate_anchor_for_skills(db: Session, required_skills: list[str]) -> tuple[int | None, int]:
    """Median weekly USD of the developers who would actually be matched here.

    Uses the same scoring that produces the founder's match list, so the build
    cost is anchored to the people shown on the page rather than a fixed rate
    card. Returns the anchor and how many developers it came from; a None anchor
    means nobody matched with a usable rate.
    """
    developers = matching_repository.list_available_developers(db)
    matches = _score_all(developers, required_skills, 0)[:RATE_SAMPLE_LIMIT]
    rates = [match.rate for match in matches if match.rate is not None]
    return median_weekly_usd(rates), len(rates)


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
    """Match developers against each blueprint role.

    Uses the same rule+semantic blend as `get_matches_semantic` per role (falling
    back to rule-only when embeddings are unavailable), so a founder viewing a
    blueprint's matches sees the same kind of ranked similarity a developer sees
    on Discover, rather than a plain skill-overlap count.
    """
    role_matches: list[RoleMatchResponse] = []
    for role in roles:
        if not isinstance(role, dict):
            continue
        title = str(
            role.get("role") or role.get("title") or role.get("role_title") or "Unspecified Role"
        )
        skills = parse_role_skills(role.get("skills"))
        semantic = get_matches_semantic(
            db,
            required_skills=skills,
            role_description=title,
            min_experience=min_experience,
            limit=limit,
        )
        role_matches.append(
            RoleMatchResponse(
                role_title=title,
                required_skills=skills,
                total_matches=semantic.total,
                matches=semantic.items,
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
        if not is_developer_profile_matchable(profile):
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


def _developer_embedding_text(profile: DeveloperProfile) -> str:
    """The developer's semantic fingerprint: role, bio and skills together.

    Skills alone match a role's skill list but miss everything a natural-language
    role_description asks about (domain, seniority, what they've actually built).
    Job title and bio carry that signal, so all three are embedded together.
    """
    parts = [profile.job_title or "", profile.bio or "", ", ".join(profile.skills or [])]
    return ". ".join(part for part in parts if part)


def sync_developer_embedding(profile: DeveloperProfile) -> None:
    if not is_developer_profile_matchable(profile):
        # Profile no longer clears the matching bar (e.g. edited down to junk) -
        # drop any stale vector rather than leaving an outdated one queryable.
        logger.info(
            "Skipping embedding sync for user %s: profile does not meet the matching quality bar",
            profile.user_id,
        )
        remove_developer_embedding(profile.user_id)
        return
    _upsert(
        pinecone_service.upsert_developer,
        str(profile.user_id),
        _developer_embedding_text(profile),
        "developer",
    )


def remove_developer_embedding(user_id: UUID) -> None:
    try:
        pinecone_service.delete_developer(str(user_id))
    except Exception:
        logger.exception("Failed to remove developer embedding for user %s", user_id)


def sync_blueprint_embedding(blueprint_id: UUID, profile_text: str) -> None:
    if not profile_text:
        return
    _upsert(
        pinecone_service.upsert_blueprint,
        str(blueprint_id),
        profile_text,
        "blueprint",
    )


def remove_blueprint_embedding(blueprint_id: UUID) -> None:
    try:
        pinecone_service.delete_blueprint(str(blueprint_id))
    except Exception:
        logger.exception("Failed to remove blueprint embedding for %s", blueprint_id)


def _upsert(upsert, vector_id: str, text: str, label: str) -> None:
    """Embedding sync never propagates: a stale vector degrades ranking, but a
    raised exception would fail the publish or profile save that triggered it."""
    try:
        embedding = embeddings_service.embed_text(
            text, input_type=embeddings_service.PASSAGE_INPUT_TYPE
        )
        if embedding:
            upsert(vector_id, embedding)
    except Exception:
        logger.exception("Failed to sync %s embedding for %s", label, vector_id)


def reindex_developer_embeddings(db: Session) -> int:
    developers = matching_repository.list_available_developers(db)
    indexed = 0
    for user in developers:
        profile = user.developer_profile
        if profile is None or not is_developer_profile_matchable(profile):
            continue
        embedding = embeddings_service.embed_text(
            _developer_embedding_text(profile), input_type=embeddings_service.PASSAGE_INPUT_TYPE
        )
        if not embedding:
            continue
        pinecone_service.upsert_developer(str(user.id), embedding)
        indexed += 1
    return indexed


def reindex_blueprint_embeddings(db: Session) -> int:
    from app.repositories import blueprints as blueprints_repository
    from app.services import discover_service

    indexed = 0
    for blueprint in blueprints_repository.list_public_blueprints(db):
        profile_text = discover_service.blueprint_embedding_text(blueprint)
        if not profile_text:
            continue
        embedding = embeddings_service.embed_text(
            profile_text, input_type=embeddings_service.PASSAGE_INPUT_TYPE
        )
        if not embedding:
            continue
        pinecone_service.upsert_blueprint(str(blueprint.id), embedding)
        indexed += 1
    return indexed
