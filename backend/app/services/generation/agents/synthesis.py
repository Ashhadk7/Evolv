from __future__ import annotations

import json
from typing import Annotated, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

from app.services.generation.agent_service import call_agent
from app.services.generation.agents.competitor import CompetitorOutput
from app.services.generation.agents.market import MarketOutput
from app.services.generation.agents.persona import PersonaOutput
from app.services.generation.agents.product import ProductOutput
from app.services.generation.agents.scorecard import ScorecardOutput
from app.services.generation.agents.strategy import StrategyOutput
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean, clip

ShortFlag = Annotated[str, Field(min_length=1, max_length=160)]
ShortNote = Annotated[str, Field(min_length=1, max_length=200)]


class RedFlag(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    flag: ShortFlag
    severity: Literal["High", "Medium", "Low"]


class SynthesisOutput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    brand_name: str = Field(alias="brandName", min_length=2, max_length=40)
    # Free-form fields are clipped, never hard-failed, when the model runs long.
    tagline: Annotated[str, BeforeValidator(clip(80))] = Field(min_length=1, max_length=80)
    executive_summary: Annotated[str, BeforeValidator(clip(900))] = Field(
        alias="executiveSummary", min_length=120, max_length=900
    )
    verdict: Literal["Build", "Validate first", "Rethink"]
    verdict_reasoning: Annotated[str, BeforeValidator(clip(300))] = Field(
        alias="verdictReasoning", min_length=1, max_length=300
    )
    red_flags: list[RedFlag] = Field(alias="redFlags", min_length=1, max_length=5)
    contradictions: list[ShortNote] = Field(default_factory=list, max_length=4)
    key_assumptions: list[ShortNote] = Field(alias="keyAssumptions", min_length=2, max_length=5)


async def run_synthesis(
    brief: str,
    market: MarketOutput,
    competitor: CompetitorOutput,
    persona: PersonaOutput,
    product: ProductOutput,
    strategy: StrategyOutput,
    scorecard: ScorecardOutput,
) -> SynthesisOutput:
    brief = clean(brief)
    if not brief:
        raise ValueError("Synthesis agent requires a startup brief.")

    return await call_agent(
        SynthesisOutput,
        load_prompt("synthesis"),
        render_prompt(
            "synthesis_user",
            brief=brief,
            market=_agent_json(market),
            competitors=_agent_json(competitor),
            personas=_agent_json(persona),
            product=_agent_json(product),
            strategy=_agent_json(strategy),
            scorecard=_agent_json(scorecard),
        ),
        max_tokens=1200,
    )


def _agent_json(payload: BaseModel) -> str:
    data = payload.model_dump(by_alias=True, exclude={"sources", "research_metadata"})
    return json.dumps(data, ensure_ascii=True)
