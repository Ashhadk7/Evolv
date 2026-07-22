"""Helper utilities and data transformers for blueprint section refinement.

Extracted from refine_service.py for clean modularity and separation of concerns.
"""
from __future__ import annotations

import json
import logging
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories import blueprints as blueprints_repository
from app.services.generation.enrichment import ResearchSource, sources_to_prompt_block

logger = logging.getLogger(__name__)

SECTION_DISPLAY: dict[str, str] = {
    "market": "Market Analysis",
    "competitor": "Competitive Landscape",
    "persona": "Target Users",
    "product": "Product Scope",
    "strategy": "Strategy & GTM",
    "techStack": "Tech Stack",
    "synthesis": "Venture Assessment",
}


def get_now_iso() -> str:
    return datetime.now(UTC).isoformat()


def build_refine_brief(intake: dict[str, Any], feedback: str) -> str:
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


def build_shared_research(agents: dict[str, Any]) -> str:
    """Rebuild a trimmed source block from stored market/competitor sources."""
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


def extract_features(agents: dict[str, Any]) -> list[str]:
    return agents.get("product", {}).get("features", [])


def persona_context_from_agents(agents: dict[str, Any]) -> str:
    """Compact persona JSON string for product/strategy prompts."""
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


def reconstruct_market_competitor(agents: dict[str, Any]):
    """Re-hydrate lightweight Pydantic objects from stored agent JSON."""
    from app.services.generation.agents.competitor import CompetitorOutput
    from app.services.generation.agents.market import MarketOutput

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


def reconstruct_persona(agents: dict[str, Any]):
    from app.services.generation.agents.persona import PersonaOutput
    try:
        return PersonaOutput.model_validate(agents.get("persona", {}))
    except Exception:
        return PersonaOutput.model_construct()


def reconstruct_product(agents: dict[str, Any]):
    from app.services.generation.agents.product import ProductOutput
    try:
        return ProductOutput.model_validate(agents.get("product", {}))
    except Exception:
        return ProductOutput.model_construct()


def reconstruct_strategy(agents: dict[str, Any]):
    from app.services.generation.agents.strategy import StrategyOutput
    try:
        return StrategyOutput.model_validate(agents.get("strategy", {}))
    except Exception:
        return StrategyOutput.model_construct()


def reconstruct_scorecard(agents: dict[str, Any]):
    from app.services.generation.agents.scorecard import ScorecardOutput
    try:
        return ScorecardOutput.model_validate(agents.get("scorecard", {}))
    except Exception:
        return ScorecardOutput.model_construct()


def patch_refine_status(db: Session, blueprint_id: UUID, section: str, status: str) -> None:
    """Write an error status into the refinement metadata block."""
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    if blueprint is None or blueprint.current_version is None:
        return
    content = dict(blueprint.current_version.content_json or {})
    content["refinement"] = {
        "section": section,
        "status": status,
        "refinedAt": get_now_iso(),
    }
    content["updatedAt"] = get_now_iso()
    blueprint.current_version.content_json = content
    db.commit()
