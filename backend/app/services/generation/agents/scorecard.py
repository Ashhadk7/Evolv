from __future__ import annotations

import json

from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

from app.services.generation.agent_service import call_agent
from app.services.generation.agents.common import SourceIndex, agent_json
from app.services.generation.agents.competitor import CompetitorOutput
from app.services.generation.agents.market import MarketOutput
from app.services.generation.agents.persona import PersonaOutput
from app.services.generation.agents.product import ProductOutput
from app.services.generation.enrichment import keep_cited_indexes
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean, clip

Justification = Annotated[str, BeforeValidator(clip(240)), Field(min_length=1, max_length=240)]


class ScoreDimension(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    score: int = Field(ge=0, le=100)
    justification: Justification
    source_indexes: list[SourceIndex] = Field(
        default_factory=list, alias="sourceIndexes", max_length=3
    )


class ScorecardOutput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    problem_severity: ScoreDimension = Field(alias="problemSeverity")
    market_quality: ScoreDimension = Field(alias="marketQuality")
    competition: ScoreDimension
    differentiation: ScoreDimension
    execution_feasibility: ScoreDimension = Field(alias="executionFeasibility")
    timing: ScoreDimension


VIABILITY_WEIGHTS: dict[str, float] = {
    "problem_severity": 0.25,
    "market_quality": 0.25,
    "differentiation": 0.20,
    "execution_feasibility": 0.15,
    "competition": 0.10,
    "timing": 0.05,
}


def derive_viability(scorecard: ScorecardOutput) -> int:
    """Weighted composite computed in code — the LLM judges dimensions, never the math."""
    total = sum(
        getattr(scorecard, dimension).score * weight
        for dimension, weight in VIABILITY_WEIGHTS.items()
    )
    return max(0, min(100, round(total)))


async def run_scorecard(
    brief: str,
    market: MarketOutput,
    competitor: CompetitorOutput,
    persona: PersonaOutput,
    product: ProductOutput,
    research: str,
    source_count: int,
) -> ScorecardOutput:
    brief = clean(brief)
    if not brief:
        raise ValueError("Scorecard agent requires a startup brief.")

    output = await call_agent(
        ScorecardOutput,
        load_prompt("scorecard"),
        render_prompt(
            "scorecard_user",
            brief=brief,
            market=agent_json(market),
            competitors=agent_json(competitor),
            personas=agent_json(persona),
            product=json.dumps(product.digest(), default=str),
            research=research,
        ),
        max_tokens=1200,
    )
    for dimension in VIABILITY_WEIGHTS:
        dim = getattr(output, dimension)
        dim.source_indexes = keep_cited_indexes(dim.source_indexes, source_count)
    return output
