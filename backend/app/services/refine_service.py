"""Blueprint refine service.

Re-runs a single targeted agent against the *existing* blueprint + founder
feedback, then writes the result back to the current version's content_json.

Supported sections (map 1-to-1 with agent names):
    market | competitor | persona | product | strategy | techStack | synthesis
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.repositories import blueprints as blueprints_repository
from app.services.generation.agent_service import AgentRateLimitError, AgentServiceError
from app.services.generation.agents.competitor import run_competitor
from app.services.generation.agents.market import run_market
from app.services.generation.agents.persona import run_persona
from app.services.generation.agents.product import run_product
from app.services.generation.agents.strategy import run_strategy
from app.services.generation.agents.synthesis import run_synthesis
from app.services.generation.agents.tech_stack import run_tech_stack
from app.services.refine_helpers import (
    SECTION_DISPLAY,
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
)

logger = logging.getLogger(__name__)


def mark_refinement_started(db: Session, blueprint_id: UUID, section: str) -> None:
    """Synchronously mark the blueprint refinement status as 'refining' in DB."""
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    if blueprint is None or blueprint.current_version is None:
        return
    content = dict(blueprint.current_version.content_json or {})
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
    """Background task: re-run one agent and patch its slice in content_json."""
    db = SessionLocal()
    try:
        await _run_refine(db, blueprint_id, section, feedback)
    except Exception:
        logger.exception("Refine failed for blueprint %s section %s", blueprint_id, section)
        patch_refine_status(db, blueprint_id, section, "failed")
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

    # Build a brief that includes the founder's feedback so the agent adapts
    agent_brief = build_refine_brief(intake, feedback)

    # Shared research block (best-effort from existing sources)
    shared_research = build_shared_research(agents)

    new_agent_output = await _call_agent_for_section(
        section=section,
        agent_brief=agent_brief,
        idea=idea,
        industry=industry,
        agents=agents,
        shared_research=shared_research,
        feedback=feedback,
    )

    # Patch only the refined section into content_json
    agents[section] = new_agent_output
    content["agents"] = agents
    content["refinement"] = {
        "section": section,
        "feedback": feedback[:300],  # store a trimmed copy for audit
        "refinedAt": get_now_iso(),
        "status": "completed",
    }
    content["updatedAt"] = get_now_iso()

    blueprint.current_version.content_json = content
    db.commit()
    logger.info("Refine completed for blueprint %s section %s", blueprint_id, section)


async def _call_agent_for_section(
    *,
    section: str,
    agent_brief: str,
    idea: str,
    industry: str,
    agents: dict[str, Any],
    shared_research: str,
    feedback: str = "",
) -> dict[str, Any]:
    """Dispatch to the correct agent and return its raw model_dump output."""
    if section == "market":
        queries = [feedback] if feedback else None
        result = await run_market(agent_brief, idea, industry, queries)
        return result.model_dump(by_alias=True)

    if section == "competitor":
        queries = [feedback, f"{feedback} competitor"] if feedback else None
        result = await run_competitor(agent_brief, idea, industry, queries)
        return result.model_dump(by_alias=True)

    if section == "persona":
        result = await run_persona(agent_brief, industry, shared_research)
        return result.model_dump(by_alias=True)

    if section == "product":
        competitor_data = agents.get("competitor", {})
        positioning_angle = competitor_data.get("positioningAngle", "")
        persona_context = persona_context_from_agents(agents)
        result = await run_product(agent_brief, positioning_angle, persona_context)
        return result.model_dump(by_alias=True)

    if section == "strategy":
        market_obj, competitor_obj = reconstruct_market_competitor(agents)
        positioning_angle = agents.get("competitor", {}).get("positioningAngle", "")
        persona_context = persona_context_from_agents(agents)
        result = await run_strategy(
            market_obj, competitor_obj, positioning_angle, shared_research, persona_context
        )
        return result.model_dump(by_alias=True)

    if section == "techStack":
        features = extract_features(agents)
        result = await run_tech_stack(agent_brief, industry, features)
        return result.model_dump(by_alias=True)

    if section == "synthesis":
        from app.services.generation.agents.scorecard import run_scorecard
        market_obj, competitor_obj = reconstruct_market_competitor(agents)
        persona_obj = reconstruct_persona(agents)
        product_obj = reconstruct_product(agents)
        strategy_obj = reconstruct_strategy(agents)
        
        scorecard_obj = await run_scorecard(agent_brief, market_obj, competitor_obj, persona_obj, shared_research)
        agents["scorecard"] = scorecard_obj.model_dump(by_alias=True)
        
        result = await run_synthesis(
            agent_brief, market_obj, competitor_obj, persona_obj,
            product_obj, strategy_obj, scorecard_obj,
        )
        return result.model_dump(by_alias=True)

    raise ValueError(f"Unknown refinable section: {section!r}")
