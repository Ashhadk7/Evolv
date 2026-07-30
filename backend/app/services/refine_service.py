from __future__ import annotations

import asyncio
import logging
from typing import Any
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.blueprint import BlueprintVersion
from app.repositories import blueprints as blueprints_repository
from app.services.exceptions import BlueprintBusyError
from app.services.generation.agent_service import AgentRateLimitError, AgentServiceError
from app.services.generation.agents.competitor import run_competitor
from app.services.generation.agents.market import run_market
from app.services.generation.blueprint_generation_service import _build_rate_card
from app.services.generation.agents.persona import run_persona
from app.services.generation.agents.product import ProductOutput, run_product
from app.services.generation.agents.research_planner import run_research_planner
from app.services.generation.agents.scorecard import ScorecardOutput, derive_viability, run_scorecard
from app.services.generation.agents.strategy import run_strategy
from app.services.generation.agents.synthesis import run_synthesis
from app.services.generation.agents.tech_stack import run_tech_stack
from app.services.generation.text import weeks_from_timeline
from app.services.refine_helpers import (
    build_refine_brief,
    build_shared_research,
    extract_features,
    get_now_iso,
    patch_refine_status,
    persona_context_from_agents,
    reconstruct_market_competitor,
    reconstruct_persona,
    reconstruct_product,
    reconstruct_strategy,
    reconstruct_tech_stack,
)

logger = logging.getLogger(__name__)


def mark_refinement_started(db: Session, blueprint_id: UUID, section: str) -> None:
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    if blueprint is None or blueprint.current_version is None:
        return
    content = dict(blueprint.current_version.content_json or {})

    if (content.get("generation") or {}).get("status") == "generating":
        raise BlueprintBusyError(
            "This blueprint is still generating. Wait for it to finish before refining a section."
        )
    if (content.get("refinement") or {}).get("status") == "refining":
        raise BlueprintBusyError(
            "Another section is being refined right now. Try again once it finishes."
        )

    content["refinement"] = {
        "section": section,
        "status": "refining",
        "refinedAt": get_now_iso(),
    }
    blueprint.current_version.content_json = content
    db.commit()


async def refine_section(
    blueprint_id: UUID,
    section: str,
    feedback: str,
) -> None:
    db = SessionLocal()
    try:
        await _run_refine(db, blueprint_id, section, feedback)
    except AgentRateLimitError as exc:
        patch_refine_status(db, blueprint_id, section, "failed", str(exc))
    except ValidationError:
        patch_refine_status(
            db,
            blueprint_id,
            section,
            "failed",
            "This blueprint predates the current format. Regenerate it to refine sections.",
        )
    except Exception:
        logger.exception("Refine failed for blueprint %s section %s", blueprint_id, section)
        patch_refine_status(db, blueprint_id, section, "failed", "Refinement failed. Please try again.")
    finally:
        db.close()


async def _run_refine(db: Session, blueprint_id: UUID, section: str, feedback: str) -> None:
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    if blueprint is None or blueprint.current_version is None:
        raise ValueError("Blueprint or current version not found.")

    content: dict[str, Any] = dict(blueprint.current_version.content_json or {})
    intake: dict[str, Any] = content.get("intake", {})
    agents: dict[str, Any] = content.get("agents", {})

    idea = intake.get("idea", "")
    industry = intake.get("industry", "")

    agent_brief = build_refine_brief(intake, feedback)
    shared_research, source_count = build_shared_research(agents)

    new_agent_output = await _call_agent_for_section(
        section=section,
        agent_brief=agent_brief,
        idea=idea,
        industry=industry,
        intake=intake,
        agents=agents,
        shared_research=shared_research,
        source_count=source_count,
        feedback=feedback,
    )

    agents[section] = new_agent_output
    content["agents"] = agents
    if section == "techStack":
        content["rateCard"] = _build_rate_card(db, reconstruct_tech_stack(agents))
    _sync_derived(blueprint.current_version, agents)
    content["refinement"] = {
        "section": section,
        "feedback": feedback[:300],
        "refinedAt": get_now_iso(),
        "status": "completed",
    }
    content["updatedAt"] = get_now_iso()

    blueprint.current_version.content_json = content
    db.commit()
    logger.info("Refine completed for blueprint %s section %s", blueprint_id, section)


def _sync_derived(version: BlueprintVersion, agents: dict[str, Any]) -> None:
    """Recompute the version's denormalised columns from the patched agents.

    These columns are what the dashboard cards and viability gauge read. Without
    this a refined section updates the document but leaves the headline numbers
    showing the previous run's values.
    """
    market = agents.get("market") or {}
    competitor = agents.get("competitor") or {}
    scorecard = agents.get("scorecard") or {}
    synthesis = agents.get("synthesis") or {}

    if isinstance(market.get("score"), int):
        version.market_potential = market["score"]
    if competitor.get("positioningAngle"):
        version.differentiator = competitor["positioningAngle"]
    if synthesis.get("brandName"):
        version.name = synthesis["brandName"]
        version.ai_recommend = f"{synthesis['verdict']}: {synthesis['verdictReasoning']}"
    if scorecard:
        try:
            version.viability = derive_viability(ScorecardOutput.model_validate(scorecard))
        except ValidationError:
            logger.warning("Scorecard unreadable for %s; viability left unchanged", version.id)


async def _replan_research(agent_brief: str):
    """Turn the corrected brief into real search queries.

    The founder's feedback used to be sent to the search provider verbatim, so
    "make it better" was executed as a web search and its results became the
    cited evidence. The brief already carries the correction, so the planner
    that builds queries during generation can build them again here, bounded to
    the same 8-90 character shape. A planner failure falls back to the template
    queries, exactly as generation does.
    """
    try:
        return await run_research_planner(agent_brief)
    except (AgentServiceError, ValidationError):
        logger.warning("Research planner failed during refine; using template queries")
        return None


async def _rescore(
    agent_brief: str,
    agents: dict[str, Any],
    product_obj: ProductOutput,
    shared_research: str,
    source_count: int,
) -> ScorecardOutput:
    """Re-run the scorecard against a product spec and write it back into `agents`.

    Execution feasibility is 15% of viability and is judged from the product
    spec, so a refined roadmap that is not rescored leaves the gauge reporting
    the previous scope. `agents` is mutated in place because the caller syncs
    the version's derived columns from it after this returns.
    """
    market_obj, competitor_obj = reconstruct_market_competitor(agents)
    scorecard_obj = await run_scorecard(
        agent_brief,
        market_obj,
        competitor_obj,
        reconstruct_persona(agents),
        product_obj,
        shared_research,
        source_count,
    )
    agents["scorecard"] = scorecard_obj.model_dump(by_alias=True)
    return scorecard_obj


async def _call_agent_for_section(
    *,
    section: str,
    agent_brief: str,
    idea: str,
    industry: str,
    intake: dict[str, Any],
    agents: dict[str, Any],
    shared_research: str,
    source_count: int,
    feedback: str = "",
) -> dict[str, Any]:
    if section in {"market", "competitor"}:
        plan = await _replan_research(agent_brief)
        if section == "market":
            queries = plan.market_queries if plan else None
            result = await run_market(agent_brief, idea, industry, queries)
        else:
            queries = plan.competitor_queries if plan else None
            result = await run_competitor(agent_brief, idea, industry, queries)
        return result.model_dump(by_alias=True)

    if section == "persona":
        result = await run_persona(agent_brief, industry, shared_research, source_count)
        return result.model_dump(by_alias=True)

    if section == "product":
        competitor_data = agents.get("competitor", {})
        positioning_angle = competitor_data.get("positioningAngle", "")
        persona_context = persona_context_from_agents(agents)
        result = await run_product(
            agent_brief,
            positioning_angle,
            persona_context,
            shared_research,
            weeks_from_timeline(intake.get("timeline", "")),
        )
        await _rescore(agent_brief, agents, result, shared_research, source_count)
        return result.model_dump(by_alias=True)

    if section == "strategy":
        market_obj, competitor_obj = reconstruct_market_competitor(agents)
        positioning_angle = agents.get("competitor", {}).get("positioningAngle", "")
        persona_context = persona_context_from_agents(agents)
        result = await run_strategy(
            market_obj, competitor_obj, positioning_angle, shared_research, persona_context, source_count
        )
        return result.model_dump(by_alias=True)

    if section == "techStack":
        features = extract_features(agents)
        result = await run_tech_stack(agent_brief, industry, features)
        return result.model_dump(by_alias=True)

    if section == "synthesis":
        market_obj, competitor_obj = reconstruct_market_competitor(agents)
        persona_obj = reconstruct_persona(agents)
        product_obj = reconstruct_product(agents)
        scorecard_obj = await _rescore(
            agent_brief, agents, product_obj, shared_research, source_count
        )

        result = await run_synthesis(
            agent_brief, market_obj, competitor_obj, persona_obj,
            product_obj, reconstruct_strategy(agents), scorecard_obj,
            reconstruct_tech_stack(agents),
        )
        return result.model_dump(by_alias=True)

    raise ValueError(f"Unknown refinable section: {section!r}")
