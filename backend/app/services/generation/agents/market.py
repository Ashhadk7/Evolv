from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.services.generation.client import call_agent
from app.services.generation.enrichment import (
    ResearchSource,
    attach_research,
    enrich_market_context,
)
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean

ShortSignal = Annotated[str, Field(min_length=1, max_length=130)]
ShortHeadwind = Annotated[str, Field(min_length=1, max_length=130)]
ShortAssumption = Annotated[str, Field(min_length=1, max_length=150)]


class MarketAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    size: str = Field(min_length=1, max_length=32)
    cagr: str = Field(min_length=1, max_length=16)
    barriers: str = Field(min_length=1, max_length=80)
    score: int = Field(ge=0, le=100)
    demand_level: Literal["High", "Medium", "Low"] = Field(alias="demandLevel")
    timing: str = Field(min_length=1, max_length=180)
    why_now: str = Field(alias="whyNow", min_length=1, max_length=240)
    insight: str = Field(min_length=1, max_length=280)
    demand_signals: list[ShortSignal] = Field(alias="demandSignals", min_length=3, max_length=5)
    headwinds: list[ShortHeadwind] = Field(min_length=2, max_length=4)
    assumptions: list[ShortAssumption] = Field(min_length=2, max_length=4)
    confidence: Literal["High", "Medium", "Low"]


class MarketOutput(MarketAnalysis):
    sources: list[ResearchSource] = Field(default_factory=list, max_length=10)
    research_metadata: dict[str, Any] = Field(default_factory=dict, alias="researchMetadata")


async def run_market(idea: str, industry: str) -> MarketOutput:
    idea = clean(idea)
    industry = clean(industry)
    if not idea:
        raise ValueError("Market agent requires a startup idea.")
    if not industry:
        raise ValueError("Market agent requires an industry/domain.")

    research = await enrich_market_context(idea, industry)
    user_prompt = render_prompt(
        "market_user",
        idea=idea,
        industry=industry,
        research=research.to_prompt_block(),
    )
    analysis = await call_agent(MarketAnalysis, load_prompt("market"), user_prompt, max_tokens=900)
    return MarketOutput.model_validate(attach_research(analysis, research))
