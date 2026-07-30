from __future__ import annotations

import asyncio
import json
import logging
import time
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.blueprint import Blueprint, BlueprintVersion, VersionState
from app.models.user import User
from app.repositories import blueprints as blueprints_repository
from app.schemas.blueprints import BlueprintGenerateRequest, BlueprintVersionCreate, LevelRating
from app.services.exceptions import (
    BlueprintAgentInputError,
    BlueprintPersistenceError,
    BlueprintVersionNotFoundError,
    FounderProfileRequiredError,
    IntakeRejectedError,
)
from app.services.generation.agent_service import AgentRateLimitError, AgentServiceError
from app.services.generation.agents.competitor import CompetitorOutput, run_competitor
from app.services.generation.agents.intake_critic import run_intake_critic
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
from app.services.generation.text import weeks_from_timeline
from app.services.matching_service import parse_role_skills, rate_anchor_for_skills

logger = logging.getLogger(__name__)


class GenerationTimeout(RuntimeError):
    """The pipeline outlived the window the founder is told to wait.

    Each agent call can ride out rate limits for minutes, so nine of them can
    outlast the client's poll by a wide margin. Stopping at the deadline keeps
    the founder's view and the server's behaviour describing the same run.
    """

CONTENT_SCHEMA_VERSION = 6
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


async def start_generation(
    db: Session, current_user: User, payload: BlueprintGenerateRequest
) -> Blueprint:
    """Gate the intake, then create the blueprint in a `generating` state.

    The critic runs here rather than in the controller so no caller can reach
    the pipeline without passing it. It costs one small call against the ~40k
    tokens and dozen web searches a junk run would otherwise spend, and nothing
    is persisted until it passes.

    The slow agent pipeline runs afterwards in a background task (run_generation),
    so the HTTP request returns quickly instead of blocking for a minute.
    """
    founder_id = _require_founder_profile(current_user)

    verdict = await run_intake_critic(payload.model_dump(mode="json"))
    if verdict.verdict != "proceed":
        raise IntakeRejectedError(verdict)

    blueprint = blueprints_repository.create_blueprint(db, founder_id, payload.visibility)
    blueprints_repository.create_version(
        db, blueprint.id, VersionState.CURRENT, _pending_version(payload)
    )
    db.commit()

    saved = blueprints_repository.get_blueprint_by_id(db, blueprint.id)
    if saved is None:
        raise BlueprintPersistenceError("Blueprint could not be created.")
    return saved


def retry_generation(db: Session, blueprint_id: UUID) -> tuple[Blueprint, BlueprintGenerateRequest]:
    """Reset an existing blueprint to `generating` and return its original inputs.

    Reuses the same row (no duplicate) by rebuilding the request from the intake
    saved in content_json. The caller must have already authorized ownership;
    it then schedules run_generation with the returned payload.
    """
    version = _current_version(db, blueprint_id)
    if version is None:
        raise BlueprintVersionNotFoundError()

    intake = (version.content_json or {}).get("intake")
    if not intake:
        raise BlueprintAgentInputError("Cannot retry: the original inputs are missing.")
    try:
        payload = BlueprintGenerateRequest(**intake)
    except ValidationError as exc:
        raise BlueprintAgentInputError("Cannot retry: the saved inputs are invalid.") from exc

    _update_generation(db, blueprint_id, status="generating", completedAgents=[], error=None)

    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    if blueprint is None:
        raise BlueprintPersistenceError("Blueprint could not be reloaded.")
    return blueprint, payload


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
    deadline = time.monotonic() + get_settings().GENERATION_DEADLINE_SECONDS

    def check_deadline() -> None:
        if time.monotonic() > deadline:
            raise GenerationTimeout()

    async def track(name: str, coro):
        check_deadline()
        result = await coro
        completed.append(name)
        _update_generation(db, blueprint_id, completedAgents=list(completed))
        return result

    async def gather_stage(*coros):
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

        market, competitor = await gather_stage(
            track("market", run_market(agent_brief, payload.idea, payload.industry, market_queries)),
            track(
                "competitor",
                run_competitor(agent_brief, payload.idea, payload.industry, competitor_queries),
            ),
        )

        shared_sources = market.sources[:5] + competitor.sources[:5]
        shared_research = sources_to_prompt_block(shared_sources, snippet_chars=300)
        persona = await track(
            "persona", run_persona(agent_brief, payload.industry, shared_research, len(shared_sources))
        )

        persona_context = _persona_context(persona)
        product, strategy = await gather_stage(
            track(
                "product",
                run_product(
                    agent_brief,
                    competitor.positioning_angle,
                    persona_context,
                    shared_research,
                    weeks_from_timeline(payload.timeline),
                ),
            ),
            track(
                "strategy",
                run_strategy(
                    market,
                    competitor,
                    competitor.positioning_angle,
                    shared_research,
                    persona_context,
                    len(shared_sources),
                ),
            ),
        )

        tech_stack, scorecard = await gather_stage(
            track(
                "techStack",
                run_tech_stack(agent_brief, payload.industry, _committed_features(product)),
            ),
            track(
                "scorecard",
                run_scorecard(
                    agent_brief,
                    market,
                    competitor,
                    persona,
                    product,
                    shared_research,
                    len(shared_sources),
                ),
            ),
        )

        synthesis = await track(
            "synthesis",
            run_synthesis(
                agent_brief, market, competitor, persona, product, strategy, scorecard, tech_stack
            ),
        )

        content = _build_blueprint_content_payload(
            payload=payload,
            rate_card=_build_rate_card(db, tech_stack),
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
    except GenerationTimeout:
        logger.warning("Blueprint generation exceeded its deadline for %s", blueprint_id)
        _update_generation(
            db,
            blueprint_id,
            status="failed",
            error=(
                "Generation took longer than expected, most likely provider rate limits. "
                "Please retry."
            ),
        )
    except (AgentRateLimitError, EnrichmentError) as exc:
        logger.warning("Blueprint generation blocked for %s: %s", blueprint_id, exc)
        _update_generation(db, blueprint_id, status="failed", error=str(exc))
    except (AgentServiceError, ValidationError):
        logger.warning("Blueprint generation failed for %s", blueprint_id, exc_info=True)
        _update_generation(
            db,
            blueprint_id,
            status="failed",
            error="Blueprint generation could not complete. Check provider keys and limits.",
        )
    except ValueError as exc:
        _update_generation(db, blueprint_id, status="failed", error=str(exc))
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
    rate_card: dict[str, Any],
    market: MarketOutput,
    competitor: CompetitorOutput,
    persona: PersonaOutput,
    product: ProductOutput,
    tech_stack: TechStackOutput,
    strategy: StrategyOutput,
    scorecard: ScorecardOutput,
    synthesis: SynthesisOutput,
) -> BlueprintVersionCreate:
    content_json = {
        "schemaVersion": CONTENT_SCHEMA_VERSION,
        "intake": _intake_json(payload),
        "rateCard": rate_card,
        "agents": {
            "market": market.model_dump(by_alias=True),
            "competitor": competitor.model_dump(by_alias=True),
            "persona": persona.model_dump(by_alias=True),
            "product": product.model_dump(by_alias=True),
            "techStack": tech_stack.model_dump(by_alias=True),
            "strategy": strategy.model_dump(by_alias=True),
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
        market_potential=scorecard.market_quality.score,
        developer_demand=_derive_developer_demand(market, persona),
        content_json=content_json,
    )


BRIEF_FIELDS = (
    ("Startup idea", "idea"),
    ("Target customer", "target_customer"),
    ("Problem", "problem"),
    ("Proposed solution", "solution"),
    ("Stage", "stage"),
    ("Estimated budget", "budget"),
    ("Timeline", "timeline"),
    ("Region/market", "region"),
    ("Monetization", "monetization"),
    ("Constraints", "constraints"),
)


def build_brief(intake: dict[str, Any]) -> str:
    """The founder's intake as the `Label: value` block every agent reads.

    Shared with refine (refine_helpers) so a re-run sees exactly the same brief
    the original generation did — two copies of this list drift apart.
    """
    return "\n".join(
        f"{label}: {intake[key]}" for label, key in BRIEF_FIELDS if intake.get(key)
    )


def _build_agent_brief(payload: BlueprintGenerateRequest) -> str:
    return build_brief(payload.model_dump(mode="json"))


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


def _build_rate_card(db: Session, tech_stack: TechStackOutput) -> dict[str, Any]:
    """Anchor the build cost to the rates of developers who match this blueprint.

    Snapshotted with the blueprint rather than recomputed on read: a founder's
    phase budgets are seeded from these figures, so a quote that moved whenever
    the developer pool changed would not be a quote. `anchorWeeklyUsd` is None
    when nobody matched with a usable rate, and the frontend then falls back to
    its own rate card.
    """
    skills = [
        skill for role in tech_stack.roles for skill in parse_role_skills(role.skills)
    ]
    try:
        anchor, sample_size = rate_anchor_for_skills(db, skills)
    except SQLAlchemyError:
        logger.warning("Rate anchor lookup failed; falling back to the default rate card")
        anchor, sample_size = None, 0
    return {
        "anchorWeeklyUsd": anchor,
        "sampleSize": sample_size,
        "basis": "matchedDevelopers" if anchor else "default",
    }


def _committed_features(product: ProductOutput) -> list[str]:
    """Feature names the stack must actually support.

    "Could" features are explicitly deferred, so sizing infrastructure and
    hiring around them inflates both against work that may never ship.
    """
    return [feature.name for feature in product.features if feature.priority != "Could"]


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
            "objections": [objection.text for objection in primary.objections],
            "acquisitionChannels": channels,
        },
        ensure_ascii=True,
    )
