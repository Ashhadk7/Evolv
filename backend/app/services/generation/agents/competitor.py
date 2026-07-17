from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

from app.services.generation.agent_service import call_agent
from app.services.generation.enrichment import (
    ResearchSource,
    attach_research,
    enrich_competitor_context,
)
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean, clip

ShortStrength = Annotated[str, Field(min_length=1, max_length=120)]
ShortWeakness = Annotated[str, Field(min_length=1, max_length=120)]
ShortGap = Annotated[str, Field(min_length=1, max_length=170)]
ShortAssumption = Annotated[str, Field(min_length=1, max_length=150)]
SourceIndex = Annotated[int, Field(ge=1, le=12)]


class CompetitorCard(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=90)
    type: Literal["Direct", "Indirect", "Adjacent"]
    positioning: str = Field(min_length=1, max_length=180)
    strengths: list[ShortStrength] = Field(min_length=1, max_length=3)
    weaknesses: list[ShortWeakness] = Field(min_length=1, max_length=3)
    gap: ShortGap
    source_indexes: list[SourceIndex] = Field(alias="sourceIndexes", max_length=3)


class CompetitorAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    competitors: list[CompetitorCard] = Field(min_length=3, max_length=6)
    white_space: list[ShortGap] = Field(alias="whiteSpace", min_length=2, max_length=4)
    positioning_angle: str = Field(alias="positioningAngle", min_length=1, max_length=220)
    threat_level: Literal["High", "Medium", "Low"] = Field(alias="threatLevel")
    insight: str = Field(min_length=1, max_length=280)
    assumptions: list[ShortAssumption] = Field(min_length=2, max_length=4)
    confidence: Literal["High", "Medium", "Low"]
    # Free-form paragraph — clipped, never hard-failed, when the model runs long.
    analysis: Annotated[str, BeforeValidator(clip(1200))] = Field(
        min_length=120, max_length=1200
    )


class CompetitorOutput(CompetitorAnalysis):
    sources: list[ResearchSource] = Field(default_factory=list, max_length=12)
    research_metadata: dict[str, Any] = Field(default_factory=dict, alias="researchMetadata")


async def run_competitor(
    brief: str, idea: str, industry: str, queries: list[str] | None = None
) -> CompetitorOutput:
    # brief (full intake) feeds the LLM; idea (short field) feeds the fallback
    # search templates — never send the multi-field brief to a search engine.
    brief = clean(brief)
    idea = clean(idea)
    industry = clean(industry)
    if not brief:
        raise ValueError("Competitor agent requires a startup brief.")
    if not industry:
        raise ValueError("Competitor agent requires an industry/domain.")

    research = await enrich_competitor_context(idea or brief, industry, queries=queries)
    user_prompt = render_prompt(
        "competitor_user",
        idea=brief,
        industry=industry,
        # Competitor mapping needs breadth more than depth: more sources,
        # shorter snippets, same trimmed token footprint as the market agent.
        research=research.to_prompt_block(max_sources=8, snippet_chars=350),
    )
    analysis = await call_agent(
        CompetitorAnalysis, load_prompt("competitor"), user_prompt, max_tokens=1500
    )
    return CompetitorOutput.model_validate(attach_research(analysis, research))
