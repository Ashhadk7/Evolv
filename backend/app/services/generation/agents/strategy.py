from __future__ import annotations

import json
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.services.generation.agents.competitor import CompetitorOutput
from app.services.generation.agents.market import MarketOutput
from app.services.generation.agent_service import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean

ShortTitle = Annotated[str, Field(min_length=1, max_length=80)]
ShortText = Annotated[str, Field(min_length=1, max_length=180)]
StrategyStep = Annotated[str, Field(min_length=1, max_length=150)]


class StrategyItem(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: ShortTitle
    text: ShortText


class StrategyAddition(StrategyItem):
    impact: str = Field(min_length=1, max_length=40)


class StrategyRisk(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    risk: ShortText
    severity: Literal["High", "Medium", "Low"]
    mitigation: ShortText


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


async def run_strategy(
    market: MarketOutput,
    competitor: CompetitorOutput,
    differentiator: str,
) -> StrategyOutput:
    differentiator = clean(differentiator)
    if not differentiator:
        raise ValueError("Strategy agent requires a differentiator.")

    return await call_agent(
        StrategyOutput,
        load_prompt("strategy"),
        render_prompt(
            "strategy_user",
            market=_agent_json(market),
            competitors=_agent_json(competitor),
            differentiator=differentiator,
        ),
        max_tokens=1300,
    )


def _agent_json(payload: BaseModel) -> str:
    data = payload.model_dump(
        by_alias=True,
        exclude={"sources", "research_metadata"},
    )
    return json.dumps(data, ensure_ascii=True)
