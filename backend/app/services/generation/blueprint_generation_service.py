from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from typing import Any

from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.blueprint import VersionState
from app.models.user import User, UserRole
from app.repositories import blueprints as blueprints_repository
from app.schemas.blueprints import (
    BlueprintGenerateRequest,
    BlueprintVersionCreate,
    LevelRating,
)
from app.services.exceptions import (
    BlueprintAgentInputError,
    BlueprintGenerationError,
    BlueprintPersistenceError,
    FounderProfileRequiredError,
)
from app.services.generation.agents.competitor import CompetitorOutput, run_competitor
from app.services.generation.agents.market import MarketOutput, run_market
from app.services.generation.agents.persona import PersonaOutput, run_persona
from app.services.generation.agents.positioning import PositioningOutput, run_positioning
from app.services.generation.client import AgentClientError
from app.services.generation.enrichment import EnrichmentError
from app.services.generation.positioning_service import CONTENT_SCHEMA_VERSION


async def generate_blueprint_from_intake(
    db: Session,
    current_user: User,
    payload: BlueprintGenerateRequest,
):
    founder_id = _require_founder_profile(current_user)
    agent_brief = _build_agent_brief(payload)

    positioning_task = asyncio.create_task(run_positioning(agent_brief, payload.industry))
    persona_task = asyncio.create_task(run_persona(agent_brief, payload.industry))
    try:
        market = await run_market(agent_brief, payload.industry)
        competitor = await run_competitor(agent_brief, payload.industry)
        positioning, persona = await asyncio.gather(positioning_task, persona_task)
    except ValueError as exc:
        await _cancel_generation_tasks(positioning_task, persona_task)
        raise BlueprintAgentInputError(str(exc)) from exc
    except (AgentClientError, EnrichmentError, ValidationError) as exc:
        await _cancel_generation_tasks(positioning_task, persona_task)
        raise BlueprintGenerationError(
            "Blueprint generation could not complete. Check GROQ_API_KEY, TAVILY_API_KEY, and provider limits."
        ) from exc

    try:
        blueprint = blueprints_repository.create_blueprint(db, founder_id, payload.visibility)
        version_payload = _build_version_payload(
            payload=payload,
            positioning=positioning,
            market=market,
            competitor=competitor,
            persona=persona,
        )
        blueprints_repository.create_version(
            db, blueprint.id, VersionState.CURRENT, version_payload
        )
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise BlueprintPersistenceError("Generated blueprint could not be saved.") from exc

    return blueprints_repository.get_blueprint_by_id(db, blueprint.id)


async def _cancel_generation_tasks(*tasks: asyncio.Task[Any]) -> None:
    pending = [task for task in tasks if not task.done()]
    for task in pending:
        task.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)


def _require_founder_profile(user: User):
    if user.role != UserRole.FOUNDER or user.founder_profile is None:
        raise FounderProfileRequiredError(
            "Only founders with a founder profile can generate blueprints."
        )
    return user.founder_profile.user_id


def _build_version_payload(
    *,
    payload: BlueprintGenerateRequest,
    positioning: PositioningOutput,
    market: MarketOutput,
    competitor: CompetitorOutput,
    persona: PersonaOutput,
) -> BlueprintVersionCreate:
    content_json = {
        "schemaVersion": CONTENT_SCHEMA_VERSION,
        "intake": _intake_json(payload),
        "agents": {
            "positioning": positioning.model_dump(by_alias=True),
            "market": market.model_dump(by_alias=True),
            "competitor": competitor.model_dump(by_alias=True),
            "persona": persona.model_dump(by_alias=True),
        },
        "generation": {
            "status": "completed",
            "completedAgents": ["positioning", "market", "competitor", "persona"],
            "updatedAt": datetime.now(UTC).isoformat(),
        },
        "updatedAt": datetime.now(UTC).isoformat(),
    }

    return BlueprintVersionCreate(
        name=positioning.name,
        industry=payload.industry,
        idea_desc=payload.idea,
        differentiator=positioning.differentiator,
        ai_recommend=_build_ai_recommendation(market, competitor, persona),
        viability=_derive_viability(market, competitor, persona),
        market_potential=market.score,
        funding_readiness=_derive_funding_readiness(payload, market),
        developer_demand=_derive_developer_demand(payload, persona),
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
    return payload.model_dump(mode="json", exclude_none=True)


def _build_ai_recommendation(
    market: MarketOutput,
    competitor: CompetitorOutput,
    persona: PersonaOutput,
) -> str:
    return (
        f"Prioritize the {market.demand_level.lower()}-demand wedge, validate "
        f"{persona.primary_persona.lower()} adoption, and position against "
        f"{competitor.threat_level.lower()} competitive pressure before expanding scope."
    )


def _derive_viability(
    market: MarketOutput,
    competitor: CompetitorOutput,
    persona: PersonaOutput,
) -> int:
    score = market.score
    score += {"High": 6, "Medium": 2, "Low": -4}[persona.confidence]
    score += {"High": -6, "Medium": 0, "Low": 5}[competitor.threat_level]
    return max(0, min(100, score))


def _derive_funding_readiness(
    payload: BlueprintGenerateRequest,
    market: MarketOutput,
) -> LevelRating:
    budget = (payload.budget or "").lower()
    if market.score >= 78 and any(token in budget for token in ("$", "k", "m", "rs", "pkr")):
        return LevelRating.HIGH
    if market.score >= 58 or payload.budget:
        return LevelRating.MEDIUM
    return LevelRating.LOW


def _derive_developer_demand(
    payload: BlueprintGenerateRequest,
    persona: PersonaOutput,
) -> LevelRating:
    idea = f"{payload.idea} {payload.industry}".lower()
    if any(token in idea for token in ("ai", "ml", "automation", "saas", "marketplace")):
        return LevelRating.HIGH
    if persona.confidence == "Low":
        return LevelRating.LOW
    return LevelRating.MEDIUM
