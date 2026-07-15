from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.blueprint import VersionState
from app.models.user import User
from app.repositories import blueprints as blueprints_repository
from app.schemas.blueprints import BlueprintGenerateRequest, BlueprintVersionCreate, LevelRating
from app.services.exceptions import (
    BlueprintAgentInputError,
    BlueprintGenerationError,
    BlueprintPersistenceError,
    FounderProfileRequiredError,
)
from app.services.generation.agents.competitor import CompetitorOutput, run_competitor
from app.services.generation.agents.market import MarketOutput, run_market
from app.services.generation.agents.persona import PersonaOutput, run_persona
from app.services.generation.agents.product import ProductOutput, run_product
from app.services.generation.agents.strategy import StrategyOutput, run_strategy
from app.services.generation.agents.tech_stack import TechStackOutput, run_tech_stack
from app.services.generation.client import AgentClientError
from app.services.generation.enrichment import EnrichmentError

CONTENT_SCHEMA_VERSION = 4


async def generate_blueprint_from_intake(
    db: Session,
    current_user: User,
    payload: BlueprintGenerateRequest,
):
    founder_id = _require_founder_profile(current_user)
    agent_brief = _build_agent_brief(payload)

    try:
        market = await run_market(agent_brief, payload.industry)
        competitor = await run_competitor(agent_brief, payload.industry)
        persona = await run_persona(agent_brief, payload.industry)
        product = await run_product(agent_brief, competitor.positioning_angle)
        tech_stack = await run_tech_stack(agent_brief, payload.industry, product.features)
        strategy = await run_strategy(market, competitor, competitor.positioning_angle)
    except ValueError as exc:
        raise BlueprintAgentInputError(str(exc)) from exc
    except (AgentClientError, EnrichmentError, ValidationError) as exc:
        raise BlueprintGenerationError(
            "Blueprint generation could not complete. Check provider keys and limits."
        ) from exc

    try:
        blueprint = blueprints_repository.create_blueprint(db, founder_id, payload.visibility)
        version_payload = _build_blueprint_content_payload (
            payload=payload,
            market=market,
            competitor=competitor,
            persona=persona,
            product=product,
            tech_stack=tech_stack,
            strategy=strategy,
        )
        blueprints_repository.create_version(
            db, blueprint.id, VersionState.CURRENT, version_payload
        )
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise BlueprintPersistenceError("Generated blueprint could not be saved.") from exc

    saved_blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint.id)
    if saved_blueprint is None:
        raise BlueprintPersistenceError("Generated blueprint could not be loaded.")
    return saved_blueprint


def _require_founder_profile(user: User) -> UUID:
    if user.founder_profile is None:
        raise FounderProfileRequiredError(
            "Only founders with a founder profile can generate blueprints."
        )
    return user.founder_profile.user_id


def _build_blueprint_content_payload (
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
            "completedAgents": [
                "market",
                "competitor",
                "persona",
                "product",
                "techStack",
                "strategy",
            ],
            "updatedAt": datetime.now(UTC).isoformat(),
        },
        "updatedAt": datetime.now(UTC).isoformat(),
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
