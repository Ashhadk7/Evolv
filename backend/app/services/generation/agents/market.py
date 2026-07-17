from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

from app.services.generation.agent_service import call_agent
from app.services.generation.enrichment import (
    ResearchSource,
    attach_research,
    enrich_market_context,
)
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean, clip

ShortSignal = Annotated[str, Field(min_length=1, max_length=130)]
ShortHeadwind = Annotated[str, Field(min_length=1, max_length=130)]
ShortAssumption = Annotated[str, Field(min_length=1, max_length=150)]
ShortBasis = Annotated[str, Field(min_length=1, max_length=150)]
SourceIndex = Annotated[int, Field(ge=1, le=10)]
EvidenceBasis = Literal["sourced", "assumption"]


class DemandSignal(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    text: ShortSignal
    source_indexes: list[SourceIndex] = Field(
        default_factory=list, alias="sourceIndexes", max_length=3
    )


class MarketAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    size: str = Field(min_length=1, max_length=32)
    size_basis: EvidenceBasis = Field(alias="sizeBasis")
    cagr: str = Field(min_length=1, max_length=16)
    cagr_basis: EvidenceBasis = Field(alias="cagrBasis")
    customer_count: int = Field(alias="customerCount", ge=1)
    customer_count_basis: ShortBasis = Field(alias="customerCountBasis")
    price_annual_usd: int = Field(alias="priceAnnualUsd", ge=1)
    price_basis: ShortBasis = Field(alias="priceBasis")
    barriers: str = Field(min_length=1, max_length=80)
    score: int = Field(ge=0, le=100)
    demand_level: Literal["High", "Medium", "Low"] = Field(alias="demandLevel")
    timing: str = Field(min_length=1, max_length=180)
    why_now: str = Field(alias="whyNow", min_length=1, max_length=240)
    insight: str = Field(min_length=1, max_length=280)
    demand_signals: list[DemandSignal] = Field(alias="demandSignals", min_length=3, max_length=5)
    headwinds: list[ShortHeadwind] = Field(min_length=2, max_length=4)
    assumptions: list[ShortAssumption] = Field(min_length=2, max_length=4)
    confidence: Literal["High", "Medium", "Low"]
    # Free-form paragraph — clipped, never hard-failed, when the model runs long.
    analysis: Annotated[str, BeforeValidator(clip(1200))] = Field(
        min_length=120, max_length=1200
    )


class MarketOutput(MarketAnalysis):
    sources: list[ResearchSource] = Field(default_factory=list, max_length=10)
    research_metadata: dict[str, Any] = Field(default_factory=dict, alias="researchMetadata")


async def run_market(
    brief: str, idea: str, industry: str, queries: list[str] | None = None
) -> MarketOutput:
    # brief (full intake) feeds the LLM; idea (short field) feeds the fallback
    # search templates — never send the multi-field brief to a search engine.
    brief = clean(brief)
    idea = clean(idea)
    industry = clean(industry)
    if not brief:
        raise ValueError("Market agent requires a startup brief.")
    if not industry:
        raise ValueError("Market agent requires an industry/domain.")

    research = await enrich_market_context(idea or brief, industry, queries=queries)
    user_prompt = render_prompt(
        "market_user",
        idea=brief,
        industry=industry,
        # Free-tier per-minute token budgets fit roughly one full-fat call —
        # trimming the research block nearly doubles pipeline throughput.
        research=research.to_prompt_block(max_sources=6, snippet_chars=450),
    )
    analysis = await call_agent(MarketAnalysis, load_prompt("market"), user_prompt, max_tokens=1500)
    return MarketOutput.model_validate(attach_research(analysis, research))
