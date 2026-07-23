from __future__ import annotations

import asyncio
import json
import logging
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.blueprint import Blueprint, BlueprintVersion, VersionState
from app.models.user import User
from app.repositories import blueprints as blueprints_repository
from app.schemas.blueprints import BlueprintGenerateRequest, BlueprintVersionCreate, LevelRating
from app.services.exceptions import BlueprintPersistenceError, FounderProfileRequiredError
from app.services.generation.agent_service import AgentRateLimitError, AgentServiceError
from app.services.generation.agents.competitor import CompetitorOutput, run_competitor
from app.services.generation.agents.market import MarketOutput, run_market
from app.services.generation.agents.persona import PersonaOutput, run_persona
from app.services.generation.agents.product import ProductOutput, run_product
from app.services.generation.agents.research_planner import run_research_planner
from app.services.generation.agents.scorecard import (
    ScorecardOutput,
    derive_viability,
    run_scorecard,
)
from app.services.generation.agents.strategy import StrategyOutput, run_strategy
from app.services.generation.agents.synthesis import SynthesisOutput, run_synthesis
from app.services.generation.agents.tech_stack import TechStackOutput, run_tech_stack
from app.services.generation.enrichment import EnrichmentError, sources_to_prompt_block

logger = logging.getLogger(__name__)

CONTENT_SCHEMA_VERSION = 5
ALL_AGENTS = [
    "market",
    "competitor",
    "persona",
    "product",
    "strategy",
    "scorecard",
    "techStack",
    "synthesis",
]


def fail_interrupted_generations(db: Session) -> int:
    """Mark generations orphaned by a server restart as failed.

    Generation runs in-process (BackgroundTasks), so a restart kills any
    in-flight pipeline and leaves its version stuck at `generating` forever.
    On boot nothing is really running, so every `generating` row is provably
    dead — flip it to `failed` so the UI shows an honest, retryable state.

    ponytail: loads matching rows and updates in Python (fine at low volume);
    switch to a single jsonb_set UPDATE if the generating backlog ever grows.
    """
    versions = db.scalars(
        select(BlueprintVersion).where(
            BlueprintVersion.content_json["generation"]["status"].astext == "generating"
        )
    ).all()
    for version in versions:
        content = dict(version.content_json or {})
        content["generation"] = {
            **content.get("generation", {}),
            "status": "failed",
            "error": "Generation was interrupted — please retry.",
            "updatedAt": _now(),
        }
        content["updatedAt"] = _now()
        version.content_json = content
    if versions:
        db.commit()
    return len(versions)


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

    async def gather_stage(*coros):
        # asyncio.gather leaves sibling tasks running when one fails — they'd
        # keep retrying rate limits (burning quota) and writing progress onto a
        # blueprint already marked failed. Cancel them with the stage.
        tasks = [asyncio.ensure_future(coro) for coro in coros]
        try:
            return await asyncio.gather(*tasks)
        except BaseException:
            for task in tasks:
                task.cancel()
            await asyncio.gather(*tasks, return_exceptions=True)
            raise

    try:
        agent_brief = _build_agent_brief(payload)

        # Stage 0 — plan idea-specific research queries. Planner failure falls
        # back to the template queries inside enrichment, so generation never
        # gets worse than the pre-planner behavior.
        market_queries: list[str] | None = None
        competitor_queries: list[str] | None = None
        try:
            plan = await run_research_planner(agent_brief)
            market_queries = plan.market_queries
            competitor_queries = plan.competitor_queries
        except (AgentServiceError, ValidationError):
            logger.warning(
                "Research planner failed for %s; using template queries", blueprint_id
            )

        # Stage 1 — market and competitor research + analysis run together.
        market, competitor = await gather_stage(
            track("market", run_market(agent_brief, payload.idea, payload.industry, market_queries)),
            track(
                "competitor",
                run_competitor(agent_brief, payload.idea, payload.industry, competitor_queries),
            ),
        )

        # Stage 2 — persona grounds itself in the stage-1 sources (no extra
        # searches). Second-hand consumers get a trimmed block (top 5 sources
        # each, short snippets) — full snippets live with market/competitor.
        shared_research = sources_to_prompt_block(
            market.sources[:5] + competitor.sources[:5], snippet_chars=300
        )
        persona = await track(
            "persona", run_persona(agent_brief, payload.industry, shared_research)
        )

        # Stage 3 — product scopes to persona pains, strategy grounds GTM in
        # persona channels, scorecard judges the assembled evidence.
        persona_context = _persona_context(persona)
        product, strategy, scorecard = await gather_stage(
            track(
                "product",
                run_product(agent_brief, competitor.positioning_angle, persona_context),
            ),
            track(
                "strategy",
                run_strategy(
                    market,
                    competitor,
                    competitor.positioning_angle,
                    shared_research,
                    persona_context,
                ),
            ),
            track(
                "scorecard",
                run_scorecard(agent_brief, market, competitor, persona, shared_research),
            ),
        )

        # Stage 4 — tech stack needs product features; synthesis reviews the
        # whole file (it does not need the tech stack, so they run together).
        tech_stack, synthesis = await gather_stage(
            track("techStack", run_tech_stack(agent_brief, payload.industry, product.features)),
            track(
                "synthesis",
                run_synthesis(
                    agent_brief, market, competitor, persona, product, strategy, scorecard
                ),
            ),
        )

        content = _build_blueprint_content_payload(
            payload=payload,
            market=market,
            competitor=competitor,
            persona=persona,
            product=product,
            tech_stack=tech_stack,
            strategy=strategy,
            scorecard=scorecard,
            synthesis=synthesis,
        )
        _finalize(db, blueprint_id, content)
    except ValueError as exc:
        _update_generation(db, blueprint_id, status="failed", error=str(exc))
    except (AgentRateLimitError, EnrichmentError) as exc:
        # Rate limits and research outages are actionable — show the real
        # cause (wait time / provider error) instead of the generic message.
        logger.warning("Blueprint generation blocked for %s: %s", blueprint_id, exc)
        _update_generation(db, blueprint_id, status="failed", error=str(exc))
    except (AgentServiceError, ValidationError):
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
    scorecard: ScorecardOutput,
    synthesis: SynthesisOutput,
) -> BlueprintVersionCreate:
    # Bottom-up SAM is computed in code from the agent's two estimates — the
    # LLM judges the inputs, never the arithmetic.
    market_dump = market.model_dump(by_alias=True)
    market_dump["bottomUpSam"] = _fmt_usd(market.customer_count * market.price_annual_usd)

    content_json = {
        "schemaVersion": CONTENT_SCHEMA_VERSION,
        "intake": _intake_json(payload),
        "agents": {
            "market": market_dump,
            "competitor": competitor.model_dump(by_alias=True),
            "persona": persona.model_dump(by_alias=True),
            "product": product.model_dump(by_alias=True),
            "techStack": tech_stack.model_dump(by_alias=True),
            "strategy": strategy.model_dump(by_alias=True),
            # sourceIndexes here refer to the trimmed shared block: indexes 1-5
            # map to the first 5 market sources, 6-10 to the first 5 competitor sources.
            "scorecard": scorecard.model_dump(by_alias=True),
            "synthesis": synthesis.model_dump(by_alias=True),
        },
        "generation": {
            "status": "completed",
            "completedAgents": ALL_AGENTS,
            "updatedAt": _now(),
        },
        "updatedAt": _now(),
    }

    viability = derive_viability(scorecard)
    return BlueprintVersionCreate(
        name=synthesis.brand_name,
        industry=payload.industry,
        idea_desc=payload.idea,
        differentiator=competitor.positioning_angle,
        ai_recommend=f"{synthesis.verdict}: {synthesis.verdict_reasoning}",
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


def _derive_developer_demand(market: MarketOutput, persona: PersonaOutput) -> LevelRating:
    if market.demand_level == "High" and persona.confidence != "Low":
        return LevelRating.HIGH
    if market.demand_level == "Low" or persona.confidence == "Low":
        return LevelRating.LOW
    return LevelRating.MEDIUM


def _persona_context(persona: PersonaOutput) -> str:
    """Compact persona digest for the product and strategy prompts."""
    primary = next(
        (p for p in persona.personas if p.segment == persona.primary_persona),
        persona.personas[0],
    )
    channels = sorted({c for p in persona.personas for c in p.acquisition_channels})
    return json.dumps(
        {
            "primaryRole": primary.role,
            "pains": primary.pains,
            "jobsToBeDone": primary.jobs_to_be_done,
            "objections": primary.objections,
            "acquisitionChannels": channels,
        },
        ensure_ascii=True,
    )


def _fmt_usd(value: int) -> str:
    for threshold, suffix in ((1_000_000_000, "B"), (1_000_000, "M"), (1_000, "K")):
        if value >= threshold:
            return f"${value / threshold:.1f}{suffix}".replace(".0", "")
    return f"${value}"
