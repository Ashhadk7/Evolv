from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.services.generation.agent_service import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean

ShortFeature = Annotated[str, Field(min_length=1, max_length=120)]
ShortScopeCut = Annotated[str, Field(min_length=1, max_length=140)]


class ProductOutput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    features: list[ShortFeature] = Field(min_length=4, max_length=7)
    out_of_scope: list[ShortScopeCut] = Field(alias="outOfScope", min_length=2, max_length=5)


async def run_product(idea: str, positioning: str) -> ProductOutput:
    idea = clean(idea)
    positioning = clean(positioning)
    if not idea:
        raise ValueError("Product agent requires a startup idea.")
    if not positioning:
        raise ValueError("Product agent requires a positioning angle.")

    return await call_agent(
        ProductOutput,
        load_prompt("product"),
        render_prompt("product_user", idea=idea, positioning=positioning),
        max_tokens=650,
    )
