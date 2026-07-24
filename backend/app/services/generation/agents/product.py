from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.core.config import get_settings
from app.services.generation.agent_service import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean

ShortScopeCut = Annotated[str, Field(min_length=1, max_length=140)]
ShortDeliverable = Annotated[str, Field(min_length=1, max_length=100)]
ShortCriterion = Annotated[str, Field(min_length=1, max_length=110)]
FeatureCriterion = Annotated[str, Field(min_length=1, max_length=140)]

Priority = Literal["Must", "Should", "Could"]
Effort = Literal["S", "M", "L"]


class Feature(BaseModel):
    """One client-spec feature: what a dev team gets at kickoff."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=80)
    module: str = Field(min_length=1, max_length=40)
    description: str = Field(min_length=1, max_length=280)
    user_story: str = Field(alias="userStory", min_length=1, max_length=200)
    priority: Priority
    acceptance_criteria: list[FeatureCriterion] = Field(
        alias="acceptanceCriteria", min_length=1, max_length=3
    )
    effort: Effort
    # Grounding guard (B1): the persona pain/job-to-be-done or research signal
    # this feature serves. A feature that can't name one is likely invented —
    # the prompt is told to drop it, and the schema makes the trace mandatory.
    addresses: str = Field(min_length=1, max_length=160)


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

    features: list[Feature] = Field(min_length=6, max_length=15)
    out_of_scope: list[ShortScopeCut] = Field(alias="outOfScope", min_length=2, max_length=5)
    phases: list[ProductPhase] = Field(min_length=3, max_length=6)

    @model_validator(mode="after")
    def _check_feature_quality(self) -> ProductOutput:
        # B2 guards: cross-field checks the schema can't express. A failure here
        # raises ValidationError, which call_agent already retries — so a bad
        # spec never reaches the user without a fresh attempt first.
        names = [f.name.strip().lower() for f in self.features]
        if len(names) != len(set(names)):
            raise ValueError("Duplicate feature names in product spec.")
        priorities = {f.priority for f in self.features}
        if "Must" not in priorities:
            raise ValueError("No Must-have feature — the MVP has no core.")
        if priorities == {"Must"}:
            raise ValueError("Every feature is marked Must — the spec is not prioritized.")
        return self


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
        # ponytail: a 6-15 feature client spec (user stories + acceptance criteria)
        # needs more room than the old 4-7 one-liners. This is the token dial —
        # raise the model to GROQ_MODEL if the fast model's spec quality is weak.
        max_tokens=3000,
        model=get_settings().GROQ_FAST_MODEL,
    )
