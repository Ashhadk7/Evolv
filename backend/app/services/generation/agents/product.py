from __future__ import annotations

import re
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.services.generation.client import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt

ShortFeature = Annotated[str, Field(min_length=8, max_length=120)]
ShortScopeCut = Annotated[str, Field(min_length=8, max_length=140)]


class ProductOutput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    features: list[ShortFeature] = Field(min_length=4, max_length=7)
    out_of_scope: list[ShortScopeCut] = Field(alias="outOfScope", min_length=2, max_length=5)


async def run_product(idea: str, positioning: str) -> ProductOutput:
    idea = _clean(idea)
    positioning = _clean(positioning)
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


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()
