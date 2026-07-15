from __future__ import annotations

import re
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.services.generation.client import call_agent
from app.services.generation.enrichment import ResearchSource, enrich_competitor_context
from app.services.generation.prompt_loader import load_prompt, render_prompt

ShortStrength = Annotated[str, Field(min_length=8, max_length=120)]
ShortWeakness = Annotated[str, Field(min_length=8, max_length=120)]
ShortGap = Annotated[str, Field(min_length=12, max_length=170)]
ShortAssumption = Annotated[str, Field(min_length=8, max_length=150)]
SourceIndex = Annotated[int, Field(ge=1, le=12)]


class CompetitorCard(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    name: str = Field(min_length=2, max_length=90)
    type: Literal["Direct", "Indirect", "Adjacent"]
    positioning: str = Field(min_length=12, max_length=180)
    strengths: list[ShortStrength] = Field(min_length=1, max_length=3)
    weaknesses: list[ShortWeakness] = Field(min_length=1, max_length=3)
    gap: ShortGap
    source_indexes: list[SourceIndex] = Field(alias="sourceIndexes", max_length=3)


class CompetitorAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    competitors: list[CompetitorCard] = Field(min_length=3, max_length=6)
    white_space: list[ShortGap] = Field(alias="whiteSpace", min_length=2, max_length=4)
    positioning_angle: str = Field(alias="positioningAngle", min_length=20, max_length=220)
    threat_level: Literal["High", "Medium", "Low"] = Field(alias="threatLevel")
    insight: str = Field(min_length=30, max_length=280)
    assumptions: list[ShortAssumption] = Field(min_length=2, max_length=4)
    confidence: Literal["High", "Medium", "Low"]


class CompetitorOutput(CompetitorAnalysis):
    sources: list[ResearchSource] = Field(default_factory=list, max_length=12)
    research_metadata: dict[str, Any] = Field(default_factory=dict, alias="researchMetadata")


async def run_competitor(idea: str, industry: str) -> CompetitorOutput:
    idea = _clean(idea)
    industry = _clean(industry)
    if not idea:
        raise ValueError("Competitor agent requires a startup idea.")
    if not industry:
        raise ValueError("Competitor agent requires an industry/domain.")

    research = await enrich_competitor_context(idea, industry)
    source_payload = [source.model_dump(by_alias=True) for source in research.sources]

    user_prompt = render_prompt(
        "competitor_user",
        idea=idea,
        industry=industry,
        research=research.to_prompt_block(),
    )
    analysis = await call_agent(
        CompetitorAnalysis,
        load_prompt("competitor"),
        user_prompt,
        max_tokens=1100,
    )
    return CompetitorOutput.model_validate(
        {
            **analysis.model_dump(by_alias=True),
            "sources": source_payload,
            "researchMetadata": research.to_metadata(),
        }
    )


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()
