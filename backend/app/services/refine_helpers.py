from __future__ import annotations

import json
import logging
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories import blueprints as blueprints_repository
from app.services.generation.blueprint_generation_service import build_brief
from app.services.generation.enrichment import ResearchSource, sources_to_prompt_block

logger = logging.getLogger(__name__)


def get_now_iso() -> str:
    return datetime.now(UTC).isoformat()


def build_refine_brief(intake: dict[str, Any], feedback: str) -> str:
    """The original brief plus the founder's correction for this re-run.

    The instruction stays section-neutral — it is prepended to whichever agent
    is being refined, so naming a specific output here (it used to demand tech
    stack changes) pollutes every other section's prompt.
    """
    return (
        "CORRECTION FROM THE FOUNDER — this overrides your earlier output:\n"
        f'"{feedback}"\n'
        "Regenerate your section so it fulfils this request, keeping everything "
        "else consistent with the brief below.\n\n"
        f"Base Brief:\n{build_brief(intake)}"
    )


def build_shared_research(agents: dict[str, Any]) -> tuple[str, int]:
    """Rebuild the stage-1 research block from stored sources.

    Returns the block and how many sources it holds, because the agents that
    cite it (scorecard) need the count to clamp fabricated source indexes.
    """

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
        return "No prior research sources available.", 0
    return sources_to_prompt_block(combined, snippet_chars=300), len(combined)


def extract_features(agents: dict[str, Any]) -> list[str]:
    """Feature names only. Features are objects on schema 6+, strings before."""
    return [
        feature.get("name", "") if isinstance(feature, dict) else feature
        for feature in agents.get("product", {}).get("features", [])
    ]


def persona_context_from_agents(agents: dict[str, Any]) -> str:
    persona_data = agents.get("persona", {})
    personas = persona_data.get("personas", [])
    primary_segment = persona_data.get("primaryPersona", "")
    primary = next((p for p in personas if p.get("segment") == primary_segment), personas[0] if personas else {})
    channels = sorted({c for p in personas for c in p.get("acquisitionChannels", [])})
    # Objections are {text, basis} objects on schema 6+, plain strings on legacy
    # blueprints — normalise both to text for the digest.
    objections = [
        o.get("text", "") if isinstance(o, dict) else o
        for o in primary.get("objections", [])
    ]
    return json.dumps({
        "primaryRole": primary.get("role", ""),
        "pains": primary.get("pains", []),
        "jobsToBeDone": primary.get("jobsToBeDone", []),
        "objections": objections,
        "acquisitionChannels": channels,
    }, ensure_ascii=True)


# Stored agent JSON -> the typed model a downstream agent expects.
#
# These deliberately let ValidationError propagate. The previous version fell
# back to `model_construct()`, which dumps to `{}` with no warning — so a
# refine would run against an empty market analysis and confidently invent one.
# Failing here marks the refine "failed" with a real reason instead, which is
# what a pre-schema-6 blueprint should do: regenerate, don't silently degrade.
def reconstruct_market_competitor(agents: dict[str, Any]):
    from app.services.generation.agents.competitor import CompetitorOutput
    from app.services.generation.agents.market import MarketOutput

    return (
        MarketOutput.model_validate(agents.get("market", {})),
        CompetitorOutput.model_validate(agents.get("competitor", {})),
    )


def reconstruct_persona(agents: dict[str, Any]):
    from app.services.generation.agents.persona import PersonaOutput

    return PersonaOutput.model_validate(agents.get("persona", {}))


def reconstruct_product(agents: dict[str, Any]):
    from app.services.generation.agents.product import ProductOutput

    return ProductOutput.model_validate(agents.get("product", {}))


def reconstruct_strategy(agents: dict[str, Any]):
    from app.services.generation.agents.strategy import StrategyOutput

    return StrategyOutput.model_validate(agents.get("strategy", {}))


def patch_refine_status(db: Session, blueprint_id: UUID, section: str, status: str) -> None:
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
