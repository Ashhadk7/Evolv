from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

from app.services.generation.agents.common import (
    EvidenceBasis,
    SourceIndex,
    agent_json,
    verify_grounding,
)
from app.services.generation.agents.competitor import CompetitorOutput
from app.services.generation.agents.market import MarketOutput
from app.services.generation.agent_service import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean, clip

ShortTitle = Annotated[str, Field(min_length=1, max_length=80)]
ShortText = Annotated[str, Field(min_length=1, max_length=180)]
StrategyStep = Annotated[str, Field(min_length=1, max_length=150)]


class StrategyItem(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: ShortTitle
    text: ShortText


class StrategyAddition(StrategyItem):
    impact: str = Field(min_length=1, max_length=40)
    # sourced = a research signal backs this; assumption = the agent's own call.
    basis: EvidenceBasis
    source_indexes: list[SourceIndex] = Field(
        default_factory=list, alias="sourceIndexes", max_length=3
    )


class StrategyRisk(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    risk: ShortText
    severity: Literal["High", "Medium", "Low"]
    mitigation: ShortText
    # sourced = a research signal backs this risk; assumption = the agent's own call.
    basis: EvidenceBasis
    source_indexes: list[SourceIndex] = Field(
        default_factory=list, alias="sourceIndexes", max_length=3
    )


class StrategyOutput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    market_lacks: list[StrategyItem] = Field(alias="marketLacks", min_length=2, max_length=4)
    recommended_additions: list[StrategyAddition] = Field(
        alias="recommendedAdditions", min_length=2, max_length=4
    )
    path_to_complete: list[StrategyStep] = Field(alias="pathToComplete", min_length=3, max_length=5)
    risks: list[StrategyRisk] = Field(min_length=3, max_length=5)
    gtm_channels: list[StrategyItem] = Field(alias="gtmChannels", min_length=3, max_length=5)
    gtm_sequence: list[StrategyStep] = Field(alias="gtmSequence", min_length=3, max_length=5)
    # Free-form paragraph — clipped, never hard-failed, when the model runs long.
    analysis: Annotated[str, BeforeValidator(clip(1200))] = Field(
        min_length=120, max_length=1200
    )


async def run_strategy(
    market: MarketOutput,
    competitor: CompetitorOutput,
    differentiator: str,
    research: str,
    personas: str,
    source_count: int = 0,
) -> StrategyOutput:
    differentiator = clean(differentiator)
    if not differentiator:
        raise ValueError("Strategy agent requires a differentiator.")

    result = await call_agent(
        StrategyOutput,
        load_prompt("strategy"),
        render_prompt(
            "strategy_user",
            market=agent_json(market),
            competitors=agent_json(competitor),
            differentiator=differentiator,
            research=research,
            personas=personas,
        ),
        max_tokens=1700,
    )
    for claim in (*result.risks, *result.recommended_additions):
        verify_grounding(claim, source_count)
    return result
