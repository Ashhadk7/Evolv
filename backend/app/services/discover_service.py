from __future__ import annotations

import re
from collections.abc import Iterable
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.blueprint import Blueprint, BlueprintVisibility, LevelRating
from app.models.user import DeveloperProfile, User, UserRole
from app.repositories import applications as applications_repository
from app.repositories import blueprints as blueprints_repository
from app.schemas.discover import (
    DiscoverBlueprintListResponse,
    DiscoverBlueprintResponse,
    DiscoverBlueprintRole,
    DiscoverFilterOptions,
    SavedDiscoverBlueprintItem,
    SavedDiscoverBlueprintListResponse,
)
from app.services.exceptions import DeveloperProfileRequiredError

TECH_LAYER_KEYS = ("frontend", "backend", "database", "vectorDb", "aiProvider", "hosting")
DEVELOPER_DEMAND_BONUS = {
    LevelRating.HIGH: 7,
    LevelRating.MEDIUM: 4,
    LevelRating.LOW: 1,
}


def list_public_blueprints(
    db: Session,
    current_user: User,
    *,
    industry: str | None,
    stage: str | None,
    tech: str | None,
    min_viability: int | None,
    q: str | None,
    limit: int,
    offset: int,
) -> DiscoverBlueprintListResponse:
    developer = _require_developer_profile(current_user)
    saved_ids = applications_repository.list_saved_blueprint_ids_for_developer(
        db, developer.user_id
    )
    application_by_blueprint = (
        applications_repository.list_application_details_by_developer(db, developer.user_id)
    )
    saved_count = len(saved_ids)
    applications_count = sum(
        1 for application in application_by_blueprint.values() if application.status == "applied"
    )

    all_items = [
        item
        for blueprint in blueprints_repository.list_public_blueprints(db)
        if (item := _blueprint_to_discover_item(
            blueprint,
            developer,
            saved_ids,
            application_by_blueprint,
        ))
        is not None
    ]

    filter_options = _build_filter_options(all_items)
    filtered = [
        item
        for item in all_items
        if _matches_filters(
            item,
            industry=industry,
            stage=stage,
            tech=tech,
            min_viability=min_viability,
            q=q,
        )
    ]
    filtered.sort(
        key=lambda item: (
            item.match_score,
            len(item.matched_skills),
            item.viability,
            item.updated_at,
        ),
        reverse=True,
    )
    paged = filtered[offset : offset + limit]

    return DiscoverBlueprintListResponse(
        total=len(filtered),
        limit=limit,
        offset=offset,
        saved_count=saved_count,
        applications_count=applications_count,
        high_match_count=sum(1 for item in all_items if item.match_score >= 75),
        filter_options=filter_options,
        items=paged,
    )


def list_saved_blueprints(
    db: Session,
    current_user: User,
    *,
    limit: int,
    offset: int,
) -> SavedDiscoverBlueprintListResponse:
    developer = _require_developer_profile(current_user)
    saved_items, total = applications_repository.list_saved_blueprints_for_developer(
        db, developer.user_id, limit=limit, offset=offset
    )
    saved_ids = {item.blueprint_id for item in saved_items}
    application_by_blueprint = applications_repository.list_application_details_by_developer(
        db, developer.user_id
    )
    items: list[SavedDiscoverBlueprintItem] = []

    for saved in saved_items:
        blueprint = saved.blueprint
        version = blueprint.current_version if blueprint is not None else None
        name = version.name if version is not None else "Unavailable blueprint"
        discover_item = None

        if (
            blueprint is not None
            and blueprint.visibility == BlueprintVisibility.PUBLIC
            and version is not None
        ):
            discover_item = _blueprint_to_discover_item(
                blueprint,
                developer,
                saved_ids,
                application_by_blueprint,
            )

        items.append(
            SavedDiscoverBlueprintItem(
                id=saved.blueprint_id,
                name=name,
                available=discover_item is not None,
                saved_at=saved.saved_at,
                blueprint=discover_item,
            )
        )

    return SavedDiscoverBlueprintListResponse(total=total, items=items)


def _require_developer_profile(user: User) -> DeveloperProfile:
    if user.role != UserRole.DEVELOPER or user.developer_profile is None:
        raise DeveloperProfileRequiredError("Only developers with a developer profile can browse.")
    return user.developer_profile


def _blueprint_to_discover_item(
    blueprint: Blueprint,
    developer: DeveloperProfile,
    saved_ids: set[UUID],
    application_by_blueprint: dict[UUID, Application],
) -> DiscoverBlueprintResponse | None:
    version = blueprint.current_version
    if version is None:
        return None

    content = _record(version.content_json)
    agents = _record(content.get("agents"))
    intake = _record(content.get("intake"))
    product = _record(agents.get("product"))
    synthesis = _record(agents.get("synthesis"))
    tech_agent = _record(agents.get("techStack"))

    roles = _extract_roles(tech_agent)
    tech_stack = _extract_tech_stack(tech_agent)
    mvp_features = _strings(product.get("features")) or _strings(content.get("features"))
    summary = (
        _string(synthesis.get("executiveSummary"))
        or _string(content.get("summary"))
        or version.idea_desc
    )
    stage = _string(intake.get("stage")) or "Not specified"
    timeline = _string(intake.get("timeline")) or None
    founder_name = _founder_name(blueprint)

    match_score, matched_skills, match_reasons = _score_blueprint(
        developer=developer,
        industry=version.industry,
        viability=version.viability,
        developer_demand=version.developer_demand,
        roles=roles,
        tech_stack=tech_stack,
    )

    application = application_by_blueprint.get(blueprint.id)
    application_active = application is not None and application.status == "applied"

    return DiscoverBlueprintResponse(
        id=blueprint.id,
        name=version.name,
        industry=version.industry,
        founder_id=blueprint.founder_id,
        founder_name=founder_name,
        stage=stage,
        summary=summary,
        differentiator=version.differentiator,
        viability=version.viability,
        developer_demand=version.developer_demand,
        tech_stack=tech_stack,
        roles=roles,
        mvp_features=mvp_features[:6],
        timeline=timeline,
        match_score=match_score,
        match_reasons=match_reasons,
        matched_skills=matched_skills,
        saved=blueprint.id in saved_ids,
        applied=application_active,
        application_id=application.id if application is not None else None,
        application_status=application.status if application is not None else None,
        applied_role=application.role if application is not None else None,
        applied_at=application.applied_at if application is not None else None,
        withdrawn_at=application.withdrawn_at if application is not None else None,
        updated_at=blueprint.updated_at,
    )


def _founder_name(blueprint: Blueprint) -> str | None:
    user = blueprint.founder_profile.user if blueprint.founder_profile else None
    if user is None:
        return None
    return f"{user.first_name} {user.last_name}".strip() or None


def _extract_roles(tech_agent: dict[str, object]) -> list[DiscoverBlueprintRole]:
    roles: list[DiscoverBlueprintRole] = []
    for item in _records(tech_agent.get("roles")):
        role = _string(item.get("role"))
        if not role:
            continue
        roles.append(
            DiscoverBlueprintRole(
                role=role,
                count=max(1, _int(item.get("count"), 1)),
                skills=_split_skills(item.get("skills")),
                lead=item.get("lead") is True,
            )
        )
    return roles


def _extract_tech_stack(tech_agent: dict[str, object]) -> list[str]:
    layers = _record(tech_agent.get("techStack"))
    stack = [_string(_record(layers.get(key)).get("chosen")) for key in TECH_LAYER_KEYS]
    return _dedupe(stack)


def _score_blueprint(
    *,
    developer: DeveloperProfile,
    industry: str,
    viability: int,
    developer_demand: LevelRating,
    roles: list[DiscoverBlueprintRole],
    tech_stack: list[str],
) -> tuple[int, list[str], list[str]]:
    developer_skills = _dedupe(developer.skills or [])
    required_skills = _dedupe(
        [*tech_stack, *(skill for role in roles for skill in role.skills)]
    )
    matched_skills = _matching_terms(developer_skills, required_skills)
    overlap = len(matched_skills) / max(len(required_skills), 1)

    profile_text = " ".join(
        _clean_text(value)
        for value in [
            developer.job_title,
            developer.bio,
            developer.preferred_budget,
            " ".join(developer_skills),
        ]
        if value
    )
    industry_match = bool(industry and _normal_key(industry) in _normal_key(profile_text))
    role_match = bool(
        developer.job_title
        and any(_normal_key(role.role) in _normal_key(developer.job_title) for role in roles)
    )

    score = 24
    score += round(overlap * 52)
    score += min(10, round(viability / 10))
    score += DEVELOPER_DEMAND_BONUS.get(developer_demand, 0)
    if industry_match:
        score += 8
    if role_match:
        score += 5
    if not developer_skills:
        score = min(score, 68)

    reasons: list[str] = []
    if matched_skills:
        reasons.append(f"Matches your skills: {', '.join(matched_skills[:4])}.")
    if industry_match:
        reasons.append(f"Aligns with your profile focus on {industry}.")
    if role_match:
        reasons.append("Open roles map closely to your profile title.")
    if developer_demand == LevelRating.HIGH:
        reasons.append("High developer demand in the build plan.")
    if viability >= 80:
        reasons.append("Strong blueprint viability for an application-ready project.")
    if not reasons:
        reasons.append("Ranked by public blueprint quality while you add more profile skills.")

    return min(98, max(35, score)), matched_skills, reasons[:4]


def _matches_filters(
    item: DiscoverBlueprintResponse,
    *,
    industry: str | None,
    stage: str | None,
    tech: str | None,
    min_viability: int | None,
    q: str | None,
) -> bool:
    if industry and _normal_key(item.industry) != _normal_key(industry):
        return False
    if stage and _normal_key(item.stage) != _normal_key(stage):
        return False
    if tech and not _matching_terms([tech], item.tech_stack):
        return False
    if min_viability is not None and item.viability < min_viability:
        return False
    if q:
        haystack = " ".join(
            [
                item.name,
                item.industry,
                item.stage,
                item.summary,
                " ".join(item.tech_stack),
                " ".join(role.role for role in item.roles),
            ]
        )
        if _normal_key(q) not in _normal_key(haystack):
            return False
    return True


def _build_filter_options(items: list[DiscoverBlueprintResponse]) -> DiscoverFilterOptions:
    return DiscoverFilterOptions(
        industries=_sorted_unique(item.industry for item in items),
        stages=_sorted_unique(item.stage for item in items if item.stage != "Not specified"),
        tech_stack=_sorted_unique(skill for item in items for skill in item.tech_stack)[:10],
    )


def _record(value: object) -> dict[str, object]:
    return value if isinstance(value, dict) else {}


def _records(value: object) -> list[dict[str, object]]:
    return [item for item in value if isinstance(item, dict)] if isinstance(value, list) else []


def _strings(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item.strip() for item in value if isinstance(item, str) and item.strip()]


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) and value.strip() else ""


def _int(value: object, fallback: int) -> int:
    return value if isinstance(value, int) and value > 0 else fallback


def _split_skills(value: object) -> list[str]:
    if isinstance(value, list):
        return _dedupe(str(item).strip() for item in value if str(item).strip())
    if not isinstance(value, str):
        return []
    return _dedupe(part.strip() for part in re.split(r"[,;/|]", value) if part.strip())


def _matching_terms(source: list[str], candidates: list[str]) -> list[str]:
    matched: list[str] = []
    normalized_source = [_normal_key(item) for item in source]
    for candidate in candidates:
        key = _normal_key(candidate)
        if not key:
            continue
        if any(
            key == source_key or key in source_key or source_key in key
            for source_key in normalized_source
        ):
            matched.append(candidate)
    return _dedupe(matched)


def _dedupe(values: Iterable[object]) -> list[str]:
    seen: set[str] = set()
    items: list[str] = []
    for raw in values:
        value = str(raw).strip()
        key = _normal_key(value)
        if value and key and key not in seen:
            seen.add(key)
            items.append(value)
    return items


def _sorted_unique(values: Iterable[object]) -> list[str]:
    return sorted(_dedupe(values), key=str.lower)


def _clean_text(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _normal_key(value: object) -> str:
    text = str(value).lower()
    return re.sub(r"[^a-z0-9+#.]+", " ", text).strip()
