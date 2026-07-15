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


def get_matches(
    db: Session,
    *,
    required_skills: list[str],
    min_experience: int = 0,
    limit: int = 10,
) -> MatchListResponse:
    developers = matching_repository.list_available_developers(db)

    scored: list[MatchedDeveloperResponse] = []
    for user in developers:
        profile = user.developer_profile
        if profile is None:
            continue
        if (profile.experience_years or 0) < min_experience:
            continue

        score = _score_developer(
            developer_skills=profile.skills,
            required_skills=required_skills,
            experience_years=profile.experience_years,
            available=profile.availability,
        )

        scored.append(
            MatchedDeveloperResponse(
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
                match_score=score,
            )
        )

    scored.sort(key=lambda item: item.match_score, reverse=True)
    top_matches = scored[:limit]

    return MatchListResponse(total=len(scored), items=top_matches)


# ---------------------------------------------------------------------------
# Final target flow: GET /blueprints/{id}/matches
#
# Reuses the exact same _score_developer() weights/logic as get_matches()
# above -- nothing about the scoring algorithm changes. The only difference
# is *where* required_skills comes from: instead of a manual `?skills=`
# query param, it's read per-role from the blueprint's content_json["roles"]
# (produced by the Generation track's Tech Stack agent, per Contract 3).
# ---------------------------------------------------------------------------


def _extract_role_title(role: dict) -> str:
    title = role.get("title") or role.get("role_title")
    return str(title) if title else "Unspecified Role"


def _extract_role_skills(role: dict) -> list[str]:
    skills = role.get("skills")
    if not isinstance(skills, list):
        return []
    return [str(skill).strip() for skill in skills if str(skill).strip()]


def _rank_developers_for_role(
    developers: list,
    *,
    required_skills: list[str],
    min_experience: int,
    limit: int,
) -> list[MatchedDeveloperResponse]:
    scored: list[MatchedDeveloperResponse] = []
    for user in developers:
        profile = user.developer_profile
        if profile is None:
            continue
        if (profile.experience_years or 0) < min_experience:
            continue

        score = _score_developer(
            developer_skills=profile.skills,
            required_skills=required_skills,
            experience_years=profile.experience_years,
            available=profile.availability,
        )

        scored.append(
            MatchedDeveloperResponse(
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
                match_score=score,
            )
        )

    scored.sort(key=lambda item: item.match_score, reverse=True)
    return scored[:limit]


def get_matches_for_blueprint_roles(
    db: Session,
    *,
    blueprint_id,
    blueprint_name: str | None,
    roles: list[dict],
    min_experience: int = 0,
    limit: int = 10,
) -> BlueprintMatchesResponse:
    """Rank developers per role, straight from a blueprint's generated roles[].

    `roles` is expected to be `content_json["roles"]` i.e. a list of
    `{"title": str, "count": int, "skills": [str, ...]}` dicts. If it's empty
    (Generation hasn't produced/populated it yet), this returns an empty
    `roles` list rather than raising -- so callers/pages never break.
    """
    developers = matching_repository.list_available_developers(db)

    role_matches: list[RoleMatchResponse] = []
    for role in roles:
        if not isinstance(role, dict):
            continue
        required_skills = _extract_role_skills(role)
        ranked = _rank_developers_for_role(
            developers,
            required_skills=required_skills,
            min_experience=min_experience,
            limit=limit,
        )
        role_matches.append(
            RoleMatchResponse(
                role_title=_extract_role_title(role),
                required_skills=required_skills,
                total_matches=len(ranked),
                matches=ranked,
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
        if profile is None:
            continue
        if (profile.experience_years or 0) < min_experience:
            continue

        rule_score = _score_developer(
            developer_skills=profile.skills,
            required_skills=required_skills,
            experience_years=profile.experience_years,
            available=profile.availability,
        )

        semantic_similarity = _semantic_similarity(profile.skills, role_description)
        if semantic_active:
            combined_score = round(
                RULE_SCORE_WEIGHT * rule_score
                + SEMANTIC_SCORE_WEIGHT * (semantic_similarity * 100)
            )
        else:
            combined_score = rule_score

        scored.append(
            MatchedDeveloperResponse(
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
                match_score=combined_score,
                semantic_score=round(semantic_similarity * 100) if semantic_active else None,
            )
        )

    scored.sort(key=lambda item: item.match_score, reverse=True)
    top_matches = scored[:limit]

    return MatchListResponse(total=len(scored), items=top_matches)
