from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.core.config import get_settings
from app.services.generation.agent_service import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt

SearchQuery = Annotated[str, Field(min_length=8, max_length=90)]


class ResearchPlan(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    market_queries: list[SearchQuery] = Field(alias="marketQueries", min_length=3, max_length=5)
    competitor_queries: list[SearchQuery] = Field(
        alias="competitorQueries", min_length=3, max_length=5
    )


async def run_research_planner(brief: str) -> ResearchPlan:
    return await call_agent(
        ResearchPlan,
        load_prompt("research_planner"),
        render_prompt("research_planner_user", brief=brief),
        max_tokens=400,
        model=get_settings().GROQ_FAST_MODEL,
    )
