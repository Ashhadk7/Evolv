from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

from app.services.generation.agent_service import call_agent
from app.services.generation.agents.common import agent_json
from app.services.generation.agents.competitor import CompetitorOutput
from app.services.generation.agents.market import MarketOutput
from app.services.generation.agents.persona import PersonaOutput
from app.services.generation.enrichment import keep_cited_indexes
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean, clip

# Free-form justification — clipped, never hard-failed, when the model runs long.
Justification = Annotated[str, BeforeValidator(clip(240)), Field(min_length=1, max_length=240)]
# Indexes reference the shared research block the orchestrator builds: up to 5
# market sources then up to 5 competitor sources. Bounded to that real ceiling.
SourceIndex = Annotated[int, Field(ge=1, le=10)]


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


# Idea/pre-seed weighting: problem and market dominate early-stage evaluation.
# ponytail: one weight profile — add stage-keyed profiles when intake stage becomes structured.
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
            research=research,
        ),
        max_tokens=1200,
    )
    # source_count = sources in the shared block the orchestrator showed; drop
    # any dimension citation past it so a score can't footnote a phantom source.
    for dimension in VIABILITY_WEIGHTS:
        dim = getattr(output, dimension)
        dim.source_indexes = keep_cited_indexes(dim.source_indexes, source_count)
    return output
