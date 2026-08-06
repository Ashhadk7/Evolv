from __future__ import annotations

import logging
import re
from collections import Counter
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.blueprint import Blueprint, BlueprintVisibility
from app.models.project import Project, ProjectMember
from app.models.user import DeveloperProfile, User, UserRole
from app.repositories import applications as applications_repository
from app.repositories import blueprints as blueprints_repository
from app.repositories import projects as projects_repository
from app.schemas.discover import (
    DiscoverApplicantsByRole,
    DiscoverBlueprintListResponse,
    DiscoverBlueprintResponse,
    DiscoverBlueprintRole,
    DiscoverFilterOptions,
    DiscoverRoleFit,
    SavedDiscoverBlueprintItem,
    SavedDiscoverBlueprintListResponse,
)
from app.services import discover_scoring, embeddings_service, pinecone_service
from app.services.discover_scoring import dedupe, matching_terms, normal_key, sorted_unique
from app.services.exceptions import DeveloperProfileRequiredError

logger = logging.getLogger(__name__)

TECH_LAYER_KEYS = ("frontend", "backend", "database", "vectorDb", "aiProvider", "hosting")
HIGH_MATCH_THRESHOLD = 75
MAX_FILTER_TECH = 10

# A blueprint whose agent pipeline failed or is still running carries placeholder
# content, so it is withheld from Discover. Blueprints predating generation
# tracking have no status at all and stay visible.
UNFINISHED_STATUSES = frozenset({"failed", "generating"})

# The generator writes these when a layer is not needed. They are answers, not
# technologies, so they must never reach a filter, a chip or a skills gap.
PLACEHOLDER_VALUES = frozenset({"none", "n a", "na", "tbd", "not applicable", "not required"})
SEMANTIC_QUERY_LIMIT = 200

SORT_MATCH = "match"
SORT_NEWEST = "newest"
SORT_APPLICANTS = "applicants"


def list_public_blueprints(
    db: Session,
    current_user: User,
    *,
    industry: str | None,
    stage: str | None,
    tech: str | None,
    role: str | None,
    min_viability: int | None,
    q: str | None,
    sort: str,
    limit: int,
    offset: int,
) -> DiscoverBlueprintListResponse:
    developer = _require_developer_profile(current_user)
    saved_ids = applications_repository.list_saved_blueprint_ids_for_developer(
        db, developer.user_id
    )
    application_by_blueprint = applications_repository.list_application_details_by_developer(
        db, developer.user_id
    )
    engagement_by_blueprint = projects_repository.list_active_memberships_by_blueprint_for_developer(
        db, developer.user_id
    )
    applicant_counts = applications_repository.count_active_applications_by_role(db)
    blueprints_by_founder = applications_repository.count_public_blueprints_by_founder(db)
    scorable = [
        blueprint
        for blueprint in blueprints_repository.list_public_blueprints(db)
        if is_scorable(blueprint)
    ]
    similarities = _semantic_similarities(developer, {str(bp.id) for bp in scorable})

    all_items = [
        item
        for blueprint in scorable
        if (
            item := _blueprint_to_discover_item(
                blueprint,
                developer,
                saved_ids,
                application_by_blueprint,
                engagement_by_blueprint,
                applicant_counts,
                blueprints_by_founder,
                similarities,
            )
        )
        is not None
    ]

    filtered = [
        item
        for item in all_items
        if _matches_filters(
            item,
            industry=industry,
            stage=stage,
            tech=tech,
            role=role,
            min_viability=min_viability,
            q=q,
        )
    ]
    _sort_items(filtered, sort)

    return DiscoverBlueprintListResponse(
        total=len(filtered),
        limit=limit,
        offset=offset,
        saved_count=len(saved_ids),
        applications_count=sum(
            1
            for application in application_by_blueprint.values()
            if application.status == "applied"
        ),
        high_match_count=sum(
            1 for item in all_items if (item.match_score or 0) >= HIGH_MATCH_THRESHOLD
        ),
        filter_options=_build_filter_options(all_items),
        items=filtered[offset : offset + limit],
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
    engagement_by_blueprint = projects_repository.list_active_memberships_by_blueprint_for_developer(
        db, developer.user_id
    )
    applicant_counts = applications_repository.count_active_applications_by_role(db)
    blueprints_by_founder = applications_repository.count_public_blueprints_by_founder(db)
    similarities = _semantic_similarities(
        developer,
        {
            str(saved.blueprint_id)
            for saved in saved_items
            if saved.blueprint is not None
            and saved.blueprint.visibility == BlueprintVisibility.PUBLIC
            and is_scorable(saved.blueprint)
        },
    )
    items: list[SavedDiscoverBlueprintItem] = []

    for saved in saved_items:
        blueprint = saved.blueprint
        version = blueprint.current_version if blueprint is not None else None
        discover_item = None

        if (
            blueprint is not None
            and blueprint.visibility == BlueprintVisibility.PUBLIC
            and version is not None
            and is_scorable(blueprint)
        ):
            discover_item = _blueprint_to_discover_item(
                blueprint,
                developer,
                saved_ids,
                application_by_blueprint,
                engagement_by_blueprint,
                applicant_counts,
                blueprints_by_founder,
                similarities,
            )

        items.append(
            SavedDiscoverBlueprintItem(
                id=saved.blueprint_id,
                name=version.name if version is not None else "Unavailable blueprint",
                available=discover_item is not None,
                saved_at=saved.saved_at,
                blueprint=discover_item,
            )
        )

    return SavedDiscoverBlueprintListResponse(total=total, items=items)


def is_scorable(blueprint: Blueprint) -> bool:
    """Whether a public blueprint is finished enough to show a developer.

    A blueprint whose agent pipeline failed or is still running carries
    placeholder content. Blueprints predating generation tracking have no status
    at all and stay visible.
    """
    version = blueprint.current_version
    if version is None:
        return False
    generation = _record(_record(version.content_json).get("generation"))
    return _string(generation.get("status")) not in UNFINISHED_STATUSES


def blueprint_embedding_text(blueprint: Blueprint) -> str:
    """The blueprint's semantic fingerprint, shared by indexing and querying so
    both sides of the comparison describe the blueprint the same way."""
    version = blueprint.current_version
    if version is None:
        return ""
    agents = _record(_record(version.content_json).get("agents"))
    tech_agent = _record(agents.get("techStack"))
    return discover_scoring.blueprint_profile_text(
        version.industry, _extract_roles(tech_agent), _extract_tech_stack(tech_agent)
    )


def _require_developer_profile(user: User) -> DeveloperProfile:
    if user.role != UserRole.DEVELOPER or user.developer_profile is None:
        raise DeveloperProfileRequiredError("Only developers with a developer profile can browse.")
    return user.developer_profile


def _similarity_for(similarities: dict[str, float], blueprint_id: UUID) -> float | None:
    """Blend every blueprint or none of them.

    Pinecone returns only its top matches, so a blueprint outside that slice has
    a genuinely low similarity rather than an unknown one. Scoring it rule-only
    would rank it above blueprints that were pulled down by a weak semantic
    score, which inverts the ordering the blend exists to produce.
    """
    if not similarities:
        return None
    return similarities.get(str(blueprint_id), 0.0)


def _semantic_similarities(
    developer: DeveloperProfile, blueprint_ids: set[str]
) -> dict[str, float]:
    """Cosine similarity per blueprint id, or {} to fall back to rule-only scoring.

    A partially built index is worse than none: any blueprint without a vector
    would blend against zero and lose roughly half its score, so the ranking
    would reflect how much of the backfill had run rather than fit. Semantic
    scoring therefore engages only when every blueprint about to be scored has a
    vector — checked against those exact ids, not a count, so a blueprint that is
    withheld from Discover cannot hold the whole page back.
    """
    if not blueprint_ids:
        return {}
    if not embeddings_service.embeddings_enabled() or not pinecone_service.index_ready():
        return {}

    embedding = embeddings_service.embed_text(discover_scoring.developer_profile_text(developer))
    if not embedding:
        return {}

    top_k = max(len(blueprint_ids), SEMANTIC_QUERY_LIMIT)
    similarities = pinecone_service.query_blueprints(embedding, top_k)
    missing = blueprint_ids - similarities.keys()
    if missing:
        logger.warning(
            "Blueprint vector index is missing %d of %d blueprints; falling back to "
            "rule-based scoring. Run reindex_developers.py to backfill.",
            len(missing),
            len(blueprint_ids),
        )
        return {}
    return _rescale({key: similarities[key] for key in blueprint_ids})


def _rescale(similarities: dict[str, float]) -> dict[str, float]:
    """Stretch raw cosines across the result set so they discriminate.

    Embedding similarity between any two pieces of software-related text lands
    in a narrow band near the top of the range, so blending the raw value mostly
    adds the same constant to every blueprint. Rescaling the set to 0-1 turns it
    back into a comparison. When every blueprint scores alike the signal carries
    no information, so it is dropped rather than amplified into noise.
    """
    lowest, highest = min(similarities.values()), max(similarities.values())
    spread = highest - lowest
    if spread <= 0:
        return {}
    return {key: (value - lowest) / spread for key, value in similarities.items()}


def _blueprint_to_discover_item(
    blueprint: Blueprint,
    developer: DeveloperProfile,
    saved_ids: set[UUID],
    application_by_blueprint: dict[UUID, Application],
    engagement_by_blueprint: dict[UUID, tuple[ProjectMember, Project]],
    applicant_counts: dict[UUID, dict[str | None, int]],
    blueprints_by_founder: dict[UUID, int],
    similarities: dict[str, float],
) -> DiscoverBlueprintResponse | None:
    version = blueprint.current_version
    if version is None:
        return None

    content = _record(version.content_json)
    agents = _record(content.get("agents"))
    intake = _record(content.get("intake"))
    synthesis = _record(agents.get("synthesis"))
    tech_agent = _record(agents.get("techStack"))

    roles = _extract_roles(tech_agent)
    tech_stack = _extract_tech_stack(tech_agent)

    score = discover_scoring.score_blueprint(
        developer=developer,
        industry=version.industry,
        viability=version.viability,
        developer_demand=version.developer_demand,
        roles=roles,
        tech_stack=tech_stack,
        semantic_similarity=_similarity_for(similarities, blueprint.id),
    )

    engagement = engagement_by_blueprint.get(blueprint.id)
    member, project = engagement if engagement is not None else (None, None)
    application = None if member is not None else application_by_blueprint.get(blueprint.id)
    by_role = applicant_counts.get(blueprint.id, {})

    return DiscoverBlueprintResponse(
        id=blueprint.id,
        name=version.name,
        industry=version.industry,
        founder_id=blueprint.founder_id,
        founder_name=_founder_name(blueprint),
        founder_blueprint_count=blueprints_by_founder.get(blueprint.founder_id, 0),
        stage=_string(intake.get("stage")) or "Not specified",
        summary=(
            _string(synthesis.get("executiveSummary"))
            or _string(content.get("summary"))
            or version.idea_desc
        ),
        viability=version.viability,
        tech_stack=tech_stack,
        roles=roles,
        match_score=score.score,
        fit_label=score.fit_label,
        best_role=score.best_role,
        role_fits=[DiscoverRoleFit(role=fit.role, fit=fit.fit) for fit in score.role_fits],
        match_reasons=score.reasons,
        matched_skills=score.matched_skills,
        skills_to_pick_up=score.skills_to_pick_up,
        applicant_count=sum(by_role.values()),
        applicants_by_role=[
            DiscoverApplicantsByRole(role=role or "General application", count=count)
            for role, count in sorted(by_role.items(), key=lambda item: item[1], reverse=True)
        ],
        saved=blueprint.id in saved_ids,
        applied=application is not None and application.status == "applied",
        application_id=application.id if application is not None else None,
        application_status=application.status if application is not None else None,
        applied_role=application.role if application is not None else None,
        applied_at=application.applied_at if application is not None else None,
        withdrawn_at=application.withdrawn_at if application is not None else None,
        engagement_status=member.status.value if member is not None else None,
        engagement_project_id=project.id if project is not None else None,
        engagement_project_title=version.name if project is not None else None,
        created_at=blueprint.created_at,
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
    chosen = (_string(_record(layers.get(key)).get("chosen")) for key in TECH_LAYER_KEYS)
    return [tech for tech in dedupe(chosen) if not _is_placeholder(tech)]


def _is_placeholder(value: str) -> bool:
    return normal_key(value) in PLACEHOLDER_VALUES


def _sort_items(items: list[DiscoverBlueprintResponse], sort: str) -> None:
    if sort == SORT_NEWEST:
        items.sort(key=lambda item: item.created_at, reverse=True)
        return
    if sort == SORT_APPLICANTS:
        items.sort(key=lambda item: (item.applicant_count, -(item.match_score or 0)))
        return
    items.sort(
        key=lambda item: (
            item.match_score or 0,
            len(item.matched_skills),
            item.viability,
            item.updated_at,
        ),
        reverse=True,
    )


def _matches_filters(
    item: DiscoverBlueprintResponse,
    *,
    industry: str | None,
    stage: str | None,
    tech: str | None,
    role: str | None,
    min_viability: int | None,
    q: str | None,
) -> bool:
    if industry and normal_key(item.industry) != normal_key(industry):
        return False
    if stage and normal_key(item.stage) != normal_key(stage):
        return False
    if tech and not matching_terms([tech], item.tech_stack):
        return False
    if role and not matching_terms([role], [entry.role for entry in item.roles]):
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
                " ".join(entry.role for entry in item.roles),
            ]
        )
        if normal_key(q) not in normal_key(haystack):
            return False
    return True


def _build_filter_options(items: list[DiscoverBlueprintResponse]) -> DiscoverFilterOptions:
    return DiscoverFilterOptions(
        industries=sorted_unique(item.industry for item in items),
        stages=sorted_unique(item.stage for item in items if item.stage != "Not specified"),
        tech_stack=_most_used_tech([item.tech_stack for item in items]),
        roles=sorted_unique(entry.role for item in items for entry in item.roles),
    )


def _most_used_tech(stacks: list[list[str]]) -> list[str]:
    """The stacks developers are most likely to filter by.

    Sorting alphabetically and then truncating offered a dropdown that ran out
    partway through the alphabet, so React and PostgreSQL were unreachable while
    obscure one-off choices took the slots. Rank by how many blueprints use each
    stack, then alphabetise the survivors for a predictable dropdown.
    """
    counts: Counter[str] = Counter()
    labels: dict[str, str] = {}
    for stack in stacks:
        for tech in dedupe(stack):
            key = normal_key(tech)
            counts[key] += 1
            labels.setdefault(key, tech)

    top_keys = [key for key, _ in counts.most_common(MAX_FILTER_TECH)]
    return sorted((labels[key] for key in top_keys), key=str.lower)


def _record(value: object) -> dict[str, object]:
    return value if isinstance(value, dict) else {}


def _records(value: object) -> list[dict[str, object]]:
    return [item for item in value if isinstance(item, dict)] if isinstance(value, list) else []


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) and value.strip() else ""


def _int(value: object, fallback: int) -> int:
    return value if isinstance(value, int) and value > 0 else fallback


def _split_skills(value: object) -> list[str]:
    if isinstance(value, list):
        parts = [str(item) for item in value]
    elif isinstance(value, str):
        parts = re.split(r"[,;/|]", value)
    else:
        return []
    return [skill for skill in dedupe(part.strip() for part in parts) if not _is_placeholder(skill)]
