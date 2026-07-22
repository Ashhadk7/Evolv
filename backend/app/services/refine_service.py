"""Blueprint refine service.

Re-runs a single targeted agent against the *existing* blueprint + founder
feedback, then writes the result back to the current version's content_json.
The version model already has current / pending states; a refine operation
writes directly onto the current version (same behaviour as the generation
service's _finalize path) because it's a founder-initiated correction, not a
full re-generation.

Supported sections (map 1-to-1 with agent names):
    market | competitor | persona | product | strategy | techStack | synthesis
"""
from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime
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
from app.services.generation.enrichment import EnrichmentError, sources_to_prompt_block

logger = logging.getLogger(__name__)

_SECTION_DISPLAY: dict[str, str] = {
    "market": "Market Analysis",
    "competitor": "Competitive Landscape",
    "persona": "Target Users",
    "product": "Product Scope",
    "strategy": "Strategy & GTM",
    "techStack": "Tech Stack",
    "synthesis": "Venture Assessment",
}


def _now() -> str:
    return datetime.now(UTC).isoformat()


def mark_refinement_started(db: Session, blueprint_id: UUID, section: str) -> None:
    """Synchronously mark the blueprint refinement status as 'refining' in DB."""
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    if blueprint is None or blueprint.current_version is None:
        return
    content = dict(blueprint.current_version.content_json or {})
    content["refinement"] = {
        "section": section,
        "status": "refining",
        "refinedAt": _now(),
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
        _patch_refine_status(db, blueprint_id, section, "failed")
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
    agent_brief = _build_refine_brief(intake, feedback)

    # Shared research block (best-effort from existing sources)
    shared_research = _build_shared_research(agents)

    new_agent_output = await _call_agent_for_section(
        section=section,
        agent_brief=agent_brief,
        idea=idea,
        industry=industry,
        agents=agents,
        shared_research=shared_research,
    )

    # Patch only the refined section into content_json
    agents[section] = new_agent_output
    content["agents"] = agents
    content["refinement"] = {
        "section": section,
        "feedback": feedback[:300],  # store a trimmed copy for audit
        "refinedAt": _now(),
        "status": "completed",
    }
    content["updatedAt"] = _now()

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
        from app.services.generation.agents.competitor import CompetitorOutput
        competitor_data = agents.get("competitor", {})
        positioning_angle = competitor_data.get("positioningAngle", "")
        persona_context = _persona_context_from_agents(agents)
        result = await run_product(agent_brief, positioning_angle, persona_context)
        return result.model_dump(by_alias=True)

    if section == "strategy":
        # Reconstruct lightweight market / competitor objects from stored data
        market_obj, competitor_obj = _reconstruct_market_competitor(agents)
        positioning_angle = agents.get("competitor", {}).get("positioningAngle", "")
        persona_context = _persona_context_from_agents(agents)
        result = await run_strategy(
            market_obj, competitor_obj, positioning_angle, shared_research, persona_context
        )
        return result.model_dump(by_alias=True)

    if section == "techStack":
        features = _extract_features(agents)
        result = await run_tech_stack(agent_brief, industry, features)
        return result.model_dump(by_alias=True)

    if section == "synthesis":
        market_obj, competitor_obj = _reconstruct_market_competitor(agents)
        persona_obj = _reconstruct_persona(agents)
        product_obj = _reconstruct_product(agents)
        strategy_obj = _reconstruct_strategy(agents)
        scorecard_obj = _reconstruct_scorecard(agents)
        result = await run_synthesis(
            agent_brief, market_obj, competitor_obj, persona_obj,
            product_obj, strategy_obj, scorecard_obj,
        )
        return result.model_dump(by_alias=True)

    raise ValueError(f"Unknown refinable section: {section!r}")


def _build_refine_brief(intake: dict[str, Any], feedback: str) -> str:
    """Reconstruct a startup brief with the founder's refinement feedback placed at the top for maximum LLM attention."""
    parts = [
        ("Startup idea", intake.get("idea", "")),
        ("Target customer", intake.get("target_customer", "")),
        ("Problem", intake.get("problem", "")),
        ("Proposed solution", intake.get("solution", "")),
        ("Stage", intake.get("stage", "")),
        ("Estimated budget", intake.get("budget", "")),
        ("Timeline", intake.get("timeline", "")),
        ("Region/market", intake.get("region", "")),
        ("Monetization", intake.get("monetization", "")),
        ("Constraints", intake.get("constraints", "")),
    ]
    base_brief = "\n".join(f"{label}: {value}" for label, value in parts if value)
    return (
        f"CRITICAL OVERRIDE INSTRUCTION FROM FOUNDER:\n"
        f"The founder specifically requested: \"{feedback}\".\n"
        f"You MUST set the tech stack choices (e.g. backend, frontend, database, etc.) to strictly fulfill this request!\n\n"
        f"Base Brief:\n{base_brief}"
    )


def _build_shared_research(agents: dict[str, Any]) -> str:
    """Rebuild a trimmed source block from stored market/competitor sources."""
    from app.services.generation.enrichment import ResearchSource

    def _parse_sources(raw_list: list[dict]) -> list[ResearchSource]:
        sources = []
        for item in raw_list[:5]:
            try:
                sources.append(ResearchSource(**item))
            except Exception:
                pass
        return sources

    market_sources = _parse_sources(agents.get("market", {}).get("sources", []))
    competitor_sources = _parse_sources(agents.get("competitor", {}).get("sources", []))
    combined = market_sources + competitor_sources
    if not combined:
        return "No prior research sources available."
    return sources_to_prompt_block(combined, snippet_chars=300)


def _extract_features(agents: dict[str, Any]) -> list[str]:
    return agents.get("product", {}).get("features", [])


def _persona_context_from_agents(agents: dict[str, Any]) -> str:
    """Compact persona JSON string for product/strategy prompts."""
    import json
    persona_data = agents.get("persona", {})
    personas = persona_data.get("personas", [])
    primary_segment = persona_data.get("primaryPersona", "")
    primary = next((p for p in personas if p.get("segment") == primary_segment), personas[0] if personas else {})
    channels = sorted({c for p in personas for c in p.get("acquisitionChannels", [])})
    return json.dumps({
        "primaryRole": primary.get("role", ""),
        "pains": primary.get("pains", []),
        "jobsToBeDone": primary.get("jobsToBeDone", []),
        "objections": primary.get("objections", []),
        "acquisitionChannels": channels,
    }, ensure_ascii=True)


def _reconstruct_market_competitor(agents: dict[str, Any]):
    """Re-hydrate lightweight Pydantic objects from stored agent JSON."""
    from app.services.generation.agents.market import MarketOutput
    from app.services.generation.agents.competitor import CompetitorOutput

    market_data = agents.get("market", {})
    competitor_data = agents.get("competitor", {})

    try:
        market_obj = MarketOutput.model_validate(market_data)
    except Exception:
        logger.warning("Could not reconstruct MarketOutput from stored data; using defaults")
        market_obj = MarketOutput.model_construct()

    try:
        competitor_obj = CompetitorOutput.model_validate(competitor_data)
    except Exception:
        logger.warning("Could not reconstruct CompetitorOutput from stored data; using defaults")
        competitor_obj = CompetitorOutput.model_construct()

    return market_obj, competitor_obj


def _reconstruct_persona(agents: dict[str, Any]):
    from app.services.generation.agents.persona import PersonaOutput
    try:
        return PersonaOutput.model_validate(agents.get("persona", {}))
    except Exception:
        return PersonaOutput.model_construct()


def _reconstruct_product(agents: dict[str, Any]):
    from app.services.generation.agents.product import ProductOutput
    try:
        return ProductOutput.model_validate(agents.get("product", {}))
    except Exception:
        return ProductOutput.model_construct()


def _reconstruct_strategy(agents: dict[str, Any]):
    from app.services.generation.agents.strategy import StrategyOutput
    try:
        return StrategyOutput.model_validate(agents.get("strategy", {}))
    except Exception:
        return StrategyOutput.model_construct()


def _reconstruct_scorecard(agents: dict[str, Any]):
    from app.services.generation.agents.scorecard import ScorecardOutput
    try:
        return ScorecardOutput.model_validate(agents.get("scorecard", {}))
    except Exception:
        return ScorecardOutput.model_construct()


def _patch_refine_status(db: Session, blueprint_id: UUID, section: str, status: str) -> None:
    """Write an error status into the refinement metadata block."""
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    if blueprint is None or blueprint.current_version is None:
        return
    content = dict(blueprint.current_version.content_json or {})
    content["refinement"] = {
        "section": section,
        "status": status,
        "refinedAt": _now(),
    }
    content["updatedAt"] = _now()
    blueprint.current_version.content_json = content
    db.commit()
