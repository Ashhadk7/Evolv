from __future__ import annotations

import re
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.services.generation.client import call_agent
from app.services.generation.enrichment import ResearchSource, enrich_market_context

ShortSignal = Annotated[str, Field(min_length=8, max_length=130)]
ShortHeadwind = Annotated[str, Field(min_length=8, max_length=130)]
ShortAssumption = Annotated[str, Field(min_length=8, max_length=150)]


class MarketAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    size: str = Field(min_length=3, max_length=16)
    cagr: str = Field(min_length=2, max_length=8)
    barriers: str = Field(min_length=6, max_length=80)
    score: int = Field(ge=0, le=100)
    demand_level: Literal["High", "Medium", "Low"] = Field(alias="demandLevel")
    timing: str = Field(min_length=20, max_length=180)
    why_now: str = Field(alias="whyNow", min_length=25, max_length=240)
    insight: str = Field(min_length=30, max_length=280)
    demand_signals: list[ShortSignal] = Field(alias="demandSignals", min_length=3, max_length=5)
    headwinds: list[ShortHeadwind] = Field(min_length=2, max_length=4)
    assumptions: list[ShortAssumption] = Field(min_length=2, max_length=4)
    confidence: Literal["High", "Medium", "Low"]

    @field_validator("size", mode="before")
    @classmethod
    def normalize_market_size(cls, value: Any) -> Any:
        if not isinstance(value, str):
            return value
        compact = value.strip().replace("USD", "")
        compact = re.sub(r"(?i)\s*(trillion)$", "T", compact)
        compact = re.sub(r"(?i)\s*(billion)$", "B", compact)
        compact = re.sub(r"(?i)\s*(million)$", "M", compact)
        compact = re.sub(r"(?i)\s*(thousand)$", "K", compact)
        compact = compact.replace(" ", "").upper()
        if not compact.startswith("$"):
            compact = f"${compact}"
        if not re.fullmatch(r"\$\d+(\.\d{1,2})?[KMBT]", compact):
            raise ValueError("size must look like '$850M', '$2.4B', or '$1.2T'.")
        return compact

    @field_validator("cagr", mode="before")
    @classmethod
    def normalize_cagr(cls, value: Any) -> Any:
        if not isinstance(value, str):
            return value
        compact = value.strip().replace(" ", "")
        compact = re.sub(r"(?i)PERCENT$", "%", compact)
        if not compact.endswith("%"):
            compact = f"{compact}%"
        if not re.fullmatch(r"\d+(\.\d)?%", compact):
            raise ValueError("cagr must look like '18%' or '18.3%'.")
        return compact


class MarketOutput(MarketAnalysis):
    sources: list[ResearchSource] = Field(default_factory=list, max_length=10)
    research_metadata: dict[str, Any] = Field(default_factory=dict, alias="researchMetadata")


MARKET_SYSTEM_PROMPT = """You are Evolv's Market Agent.
Create a compact market estimate for a startup blueprint.
Return practical estimates, not hype. Do not invent citations or source names.
Use the provided research signals as grounding evidence.
When the sources do not prove exact market size or CAGR, make a directional estimate and say so in assumptions.
Use confidence='Low' when sources are thin, old, or only adjacent to the idea.
Use confidence='Medium' when sources support the category but not the exact wedge.
Use confidence='High' only when sources strongly support the exact product category.
Keep every sentence short enough for dashboard cards.
Return JSON only."""


async def run_market(idea: str, industry: str) -> MarketOutput:
    idea = _clean(idea)
    industry = _clean(industry)
    if not idea:
        raise ValueError("Market agent requires a startup idea.")
    if not industry:
        raise ValueError("Market agent requires an industry/domain.")

    research = await enrich_market_context(idea, industry)
    source_payload = [
        source.model_dump(by_alias=True) for source in research.sources
    ]

    user_prompt = (
        f"Idea: {idea}\n"
        f"Industry: {industry}\n\n"
        "Estimate the market for the first realistic wedge, not the largest possible global market. "
        "Return size as $numberK/M/B/T and cagr as a percent.\n\n"
        "Research signals collected by Evolv:\n"
        f"{research.to_prompt_block()}\n\n"
        "Do not add a sources field. Evolv will attach the collected source metadata separately."
    )
    analysis = await call_agent(
        MarketAnalysis,
        MARKET_SYSTEM_PROMPT,
        user_prompt,
        max_tokens=900,
        retries=1,
    )
    return MarketOutput.model_validate(
        {
            **analysis.model_dump(by_alias=True),
            "sources": source_payload,
            "researchMetadata": research.to_metadata(),
        }
    )


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()
