from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.core.config import get_settings
from app.services.generation.agent_service import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean

ShortFeature = Annotated[str, Field(min_length=1, max_length=120)]
ShortScopeCut = Annotated[str, Field(min_length=1, max_length=140)]
ShortDeliverable = Annotated[str, Field(min_length=1, max_length=100)]
ShortCriterion = Annotated[str, Field(min_length=1, max_length=110)]


class ProductPhase(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=60)
    weeks: int = Field(ge=1, le=8)
    deliverables: list[ShortDeliverable] = Field(min_length=2, max_length=4)
    acceptance_criteria: list[ShortCriterion] = Field(
        alias="acceptanceCriteria", min_length=1, max_length=2
    )
    primary_skill: str = Field(alias="primarySkill", min_length=1, max_length=40)


class ProductOutput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    features: list[ShortFeature] = Field(min_length=4, max_length=7)
    out_of_scope: list[ShortScopeCut] = Field(alias="outOfScope", min_length=2, max_length=5)
    phases: list[ProductPhase] = Field(min_length=3, max_length=6)


async def run_product(idea: str, positioning: str, persona: str) -> ProductOutput:
    idea = clean(idea)
    positioning = clean(positioning)
    if not idea:
        raise ValueError("Product agent requires a startup idea.")
    if not positioning:
        raise ValueError("Product agent requires a positioning angle.")

    return await call_agent(
        ProductOutput,
        load_prompt("product"),
        render_prompt("product_user", idea=idea, positioning=positioning, persona=persona),
        max_tokens=1300,
        model=get_settings().GROQ_FAST_MODEL,
    )
