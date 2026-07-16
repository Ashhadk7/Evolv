from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.blueprint import Blueprint, BlueprintVersion, VersionState
from app.models.user import User
from app.repositories import blueprints as blueprints_repository
from app.schemas.blueprints import BlueprintGenerateRequest, BlueprintVersionCreate, LevelRating
from app.services.exceptions import BlueprintPersistenceError, FounderProfileRequiredError
from app.services.generation.agents.competitor import CompetitorOutput, run_competitor
from app.services.generation.agents.market import MarketOutput, run_market
from app.services.generation.agents.persona import PersonaOutput, run_persona
from app.services.generation.agents.product import ProductOutput, run_product
from app.services.generation.agents.strategy import StrategyOutput, run_strategy
from app.services.generation.agents.tech_stack import TechStackOutput, run_tech_stack
from app.services.generation.client import AgentClientError
from app.services.generation.enrichment import EnrichmentError

logger = logging.getLogger(__name__)

CONTENT_SCHEMA_VERSION = 4
ALL_AGENTS = ["market", "competitor", "persona", "product", "strategy", "techStack"]


def start_generation(
    db: Session, current_user: User, payload: BlueprintGenerateRequest
) -> Blueprint:
    """Create the blueprint immediately in a `generating` state and return it.

    The slow agent pipeline runs afterwards in a background task (run_generation),
    so the HTTP request returns in milliseconds instead of blocking for a minute.
    """
    founder_id = _require_founder_profile(current_user)
    blueprint = blueprints_repository.create_blueprint(db, founder_id, payload.visibility)
    blueprints_repository.create_version(
        db, blueprint.id, VersionState.CURRENT, _pending_version(payload)
    )
    db.commit()

    saved = blueprints_repository.get_blueprint_by_id(db, blueprint.id)
    if saved is None:
        raise BlueprintPersistenceError("Blueprint could not be created.")
    return saved


async def run_generation(blueprint_id: UUID, payload: BlueprintGenerateRequest) -> None:
    """Run the agent pipeline and write the result onto the blueprint's version.

    Runs in the background with its own DB session. Independent agents run
    concurrently; dependent ones wait only for what they actually need. Each
    agent marks itself done the moment it finishes, so the frontend's poll shows
    progress advancing one agent at a time.

    ponytail: uses FastAPI BackgroundTasks (in-process) — if the server restarts
    mid-generation the blueprint stays `generating`. Move to a durable queue only
    if that becomes a real problem at scale.
    """
    db = SessionLocal()
    completed: list[str] = []

    async def track(name: str, coro):
        result = await coro
        completed.append(name)
        _update_generation(db, blueprint_id, completedAgents=list(completed))
        return result

    try:
        agent_brief = _build_agent_brief(payload)

        # Stage 1 — market, competitor, persona are independent: run together.
        market, competitor, persona = await asyncio.gather(
            track("market", run_market(agent_brief, payload.industry)),
            track("competitor", run_competitor(agent_brief, payload.industry)),
            track("persona", run_persona(agent_brief, payload.industry)),
        )

        # Stage 2 — both need only stage-1 output.
        product, strategy = await asyncio.gather(
            track("product", run_product(agent_brief, competitor.positioning_angle)),
            track("strategy", run_strategy(market, competitor, competitor.positioning_angle)),
        )

        # Stage 3 — needs product features.
        tech_stack = await track(
            "techStack", run_tech_stack(agent_brief, payload.industry, product.features)
        )

        content = _build_blueprint_content_payload(
            payload=payload,
            market=market,
            competitor=competitor,
            persona=persona,
            product=product,
            tech_stack=tech_stack,
            strategy=strategy,
        )
        _finalize(db, blueprint_id, content)
    except ValueError as exc:
        _update_generation(db, blueprint_id, status="failed", error=str(exc))
    except (AgentClientError, EnrichmentError, ValidationError):
        # Log the real cause (provider error / schema mismatch) — the user-facing
        # message stays generic, but a failed generation must be diagnosable.
        logger.warning("Blueprint generation failed for %s", blueprint_id, exc_info=True)
        _update_generation(
            db,
            blueprint_id,
            status="failed",
            error="Blueprint generation could not complete. Check provider keys and limits.",
        )
    except Exception:
        logger.exception("Unexpected blueprint generation failure for %s", blueprint_id)
        _update_generation(
            db,
            blueprint_id,
            status="failed",
            error="Blueprint generation failed unexpectedly. Please try again.",
        )
    finally:
        db.close()


def _now() -> str:
    return datetime.now(UTC).isoformat()


def _pending_version(payload: BlueprintGenerateRequest) -> BlueprintVersionCreate:
    return BlueprintVersionCreate(
        name=_derive_blueprint_name(payload),
        industry=payload.industry,
        idea_desc=payload.idea,
        differentiator="Generating…",
        ai_recommend="Generating…",
        viability=0,
        market_potential=0,
        developer_demand=LevelRating.MEDIUM,
        content_json={
            "schemaVersion": CONTENT_SCHEMA_VERSION,
            "intake": _intake_json(payload),
            "generation": {"status": "generating", "completedAgents": [], "updatedAt": _now()},
            "updatedAt": _now(),
        },
    )


def _current_version(db: Session, blueprint_id: UUID) -> BlueprintVersion | None:
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    return blueprint.current_version if blueprint else None


# One write path for both progress updates and failures — merges the given
# fields into the version's `generation` block.
def _update_generation(db: Session, blueprint_id: UUID, **changes: Any) -> None:
    version = _current_version(db, blueprint_id)
    if version is None:
        return
    content = dict(version.content_json or {})
    content["generation"] = {**content.get("generation", {}), **changes, "updatedAt": _now()}
    content["updatedAt"] = _now()
    version.content_json = content
    db.commit()


def _finalize(db: Session, blueprint_id: UUID, content: BlueprintVersionCreate) -> None:
    version = _current_version(db, blueprint_id)
    if version is None:
        raise BlueprintPersistenceError("Generated blueprint version disappeared.")
    blueprints_repository.update_version(db, version, content)
    db.commit()


def _require_founder_profile(user: User) -> UUID:
    if user.founder_profile is None:
        raise FounderProfileRequiredError(
            "Only founders with a founder profile can generate blueprints."
        )
    return user.founder_profile.user_id


def _build_blueprint_content_payload(
    *,
    payload: BlueprintGenerateRequest,
    market: MarketOutput,
    competitor: CompetitorOutput,
    persona: PersonaOutput,
    product: ProductOutput,
    tech_stack: TechStackOutput,
    strategy: StrategyOutput,
) -> BlueprintVersionCreate:
    content_json = {
        "schemaVersion": CONTENT_SCHEMA_VERSION,
        "intake": _intake_json(payload),
        "agents": {
            "market": market.model_dump(by_alias=True),
            "competitor": competitor.model_dump(by_alias=True),
            "persona": persona.model_dump(by_alias=True),
            "product": product.model_dump(by_alias=True),
            "techStack": tech_stack.model_dump(by_alias=True),
            "strategy": strategy.model_dump(by_alias=True),
        },
        "generation": {
            "status": "completed",
            "completedAgents": ALL_AGENTS,
            "updatedAt": _now(),
        },
        "updatedAt": _now(),
    }

    viability = _derive_viability(market, competitor, persona)
    return BlueprintVersionCreate(
        name=_derive_blueprint_name(payload),
        industry=payload.industry,
        idea_desc=payload.idea,
        differentiator=competitor.positioning_angle,
        ai_recommend=_build_ai_recommendation(market, competitor, persona),
        viability=viability,
        market_potential=market.score,
        developer_demand=_derive_developer_demand(market, persona),
        content_json=content_json,
    )


def _build_agent_brief(payload: BlueprintGenerateRequest) -> str:
    parts = [
        ("Startup idea", payload.idea),
        ("Target customer", payload.target_customer),
        ("Problem", payload.problem),
        ("Proposed solution", payload.solution),
        ("Stage", payload.stage),
        ("Estimated budget", payload.budget),
        ("Timeline", payload.timeline),
        ("Region/market", payload.region),
        ("Monetization", payload.monetization),
        ("Constraints", payload.constraints),
    ]
    return "\n".join(f"{label}: {value}" for label, value in parts if value)


def _intake_json(payload: BlueprintGenerateRequest) -> dict[str, Any]:
    data = payload.model_dump(mode="json")
    return {key: value for key, value in data.items() if value != ""}


def _derive_blueprint_name(payload: BlueprintGenerateRequest) -> str:
    source = payload.solution or payload.idea
    words = [word.strip(".,:;!?()[]{}") for word in source.split()]
    name = " ".join(word for word in words[:5] if word)
    return name[:64] or f"{payload.industry} Blueprint"


def _build_ai_recommendation(
    market: MarketOutput,
    competitor: CompetitorOutput,
    persona: PersonaOutput,
) -> str:
    return (
        f"Validate the {market.demand_level.lower()}-demand wedge with "
        f"{persona.primary_persona.lower()} users, then address "
        f"{competitor.threat_level.lower()} competitive pressure before expanding scope."
    )


def _derive_viability(
    market: MarketOutput,
    competitor: CompetitorOutput,
    persona: PersonaOutput,
) -> int:
    score = market.score
    if persona.confidence == "High":
        score += 5
    elif persona.confidence == "Low":
        score -= 5

    if competitor.threat_level == "High":
        score -= 6
    elif competitor.threat_level == "Low":
        score += 4

    return _clamp_score(score)


def _derive_developer_demand(market: MarketOutput, persona: PersonaOutput) -> LevelRating:
    if market.demand_level == "High" and persona.confidence != "Low":
        return LevelRating.HIGH
    if market.demand_level == "Low" or persona.confidence == "Low":
        return LevelRating.LOW
    return LevelRating.MEDIUM


def _clamp_score(score: int) -> int:
    return max(0, min(100, score))
