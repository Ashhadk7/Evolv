from __future__ import annotations

from collections.abc import Callable
from graphlib import CycleError, TopologicalSorter
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.services.generation.agent_service import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean

ShortScopeCut = Annotated[str, Field(min_length=1, max_length=140)]
ShortDeliverable = Annotated[str, Field(min_length=1, max_length=100)]
ShortCriterion = Annotated[str, Field(min_length=1, max_length=110)]
FeatureCriterion = Annotated[str, Field(min_length=1, max_length=180)]
FeatureName = Annotated[str, Field(min_length=1, max_length=80)]
EntityField = Annotated[str, Field(min_length=1, max_length=60)]
NonFunctional = Annotated[str, Field(min_length=1, max_length=140)]

Priority = Literal["Must", "Should", "Could"]
Effort = Literal["S", "M", "L"]


class DataEntity(BaseModel):
    """A core domain object the build revolves around — the data model at a glance."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=40)
    fields: list[EntityField] = Field(min_length=2, max_length=8)


class Feature(BaseModel):
    """One client-spec feature: what a dev team gets at kickoff."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=80)
    module: str = Field(min_length=1, max_length=40)
    description: str = Field(min_length=1, max_length=280)
    user_story: str = Field(alias="userStory", min_length=1, max_length=200)
    priority: Priority
    acceptance_criteria: list[FeatureCriterion] = Field(
        alias="acceptanceCriteria", min_length=1, max_length=5
    )
    effort: Effort
    dependencies: list[FeatureName] = Field(default_factory=list, max_length=4)
    addresses: str = Field(min_length=1, max_length=160)


class ProductPhase(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=60)
    weeks: int = Field(ge=1, le=12)
    deliverables: list[ShortDeliverable] = Field(min_length=2, max_length=4)
    acceptance_criteria: list[ShortCriterion] = Field(
        alias="acceptanceCriteria", min_length=1, max_length=2
    )
    primary_skill: str = Field(alias="primarySkill", min_length=1, max_length=40)


class ProductOutput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    features: list[Feature] = Field(min_length=6, max_length=15)
    out_of_scope: list[ShortScopeCut] = Field(alias="outOfScope", min_length=2, max_length=5)
    data_entities: list[DataEntity] = Field(alias="dataEntities", min_length=2, max_length=8)
    non_functional: list[NonFunctional] = Field(alias="nonFunctional", min_length=2, max_length=6)
    phases: list[ProductPhase] = Field(min_length=3, max_length=6)

    @model_validator(mode="after")
    def _check_feature_quality(self) -> ProductOutput:
        names = [f.name.strip().lower() for f in self.features]
        if len(names) != len(set(names)):
            raise ValueError("Duplicate feature names in product spec.")
        priorities = {f.priority for f in self.features}
        if "Must" not in priorities:
            raise ValueError("No Must-have feature — the MVP has no core.")
        if priorities == {"Must"}:
            raise ValueError("Every feature is marked Must — the spec is not prioritized.")

        valid = set(names)
        for feature in self.features:
            key = feature.name.strip().lower()
            feature.dependencies = [
                dep
                for dep in feature.dependencies
                if dep.strip().lower() in valid and dep.strip().lower() != key
            ]

        graph = {
            f.name.strip().lower(): {d.strip().lower() for d in f.dependencies}
            for f in self.features
        }
        try:
            TopologicalSorter(graph).prepare()
        except CycleError as exc:
            raise ValueError(
                "Feature dependencies form a cycle, so the build order cannot be followed. "
                "Break the loop so every feature can be built after the ones it needs."
            ) from exc
        return self


async def run_product(
    idea: str, positioning: str, persona: str, research: str = "", timeline_weeks: int = 0
) -> ProductOutput:
    idea = clean(idea)
    positioning = clean(positioning)
    if not idea:
        raise ValueError("Product agent requires a startup idea.")
    if not positioning:
        raise ValueError("Product agent requires a positioning angle.")

    return await call_agent(
        ProductOutput,
        load_prompt("product"),
        render_prompt(
            "product_user",
            idea=idea,
            positioning=positioning,
            persona=persona,
            research=research,
            timeline=_timeline_budget(timeline_weeks),
        ),
        max_tokens=6000,
        verify=_fits_timeline(timeline_weeks),
    )


PHASE_WEEK_TOLERANCE = 0.2


def _fits_timeline(weeks: int) -> Callable[[ProductOutput], None] | None:
    """Reject a roadmap whose phases do not add up to the founder's timeline.

    The frontend prices the build as the sum of these weeks, so a roadmap that
    silently runs short quotes the founder a fraction of the real cost. The
    model is asked to hit the budget in the prompt; this is what makes it true.
    """
    if weeks <= 0:
        return None

    low, high = weeks * (1 - PHASE_WEEK_TOLERANCE), weeks * (1 + PHASE_WEEK_TOLERANCE)

    def check(spec: ProductOutput) -> None:
        planned = sum(phase.weeks for phase in spec.phases)
        if not low <= planned <= high:
            raise ValueError(
                f"Phase weeks total {planned} but the founder's timeline is about "
                f"{weeks} weeks. Re-scope the phases so they sum to roughly {weeks}."
            )

    return check


def _timeline_budget(weeks: int) -> str:
    """The phase-week budget line for the prompt.

    The founder's timeline reaches the model as one line inside the brief and
    nothing tells it that `phases[].weeks` must add up to that. Restating it as
    an explicit budget is what keeps the derived build cost honest, because the
    frontend prices the build straight off the sum of these weeks.
    """
    if weeks <= 0:
        return "The founder gave no usable timeline — size the phases to the scope."
    return (
        f"The founder's stated timeline is about {weeks} weeks. Your phase weeks "
        f"MUST sum to roughly {weeks} (within ~20%) — scope the phases to fit it, "
        "and if the scope genuinely cannot fit, cut features to 'Could' rather "
        "than pretending the build is shorter than it is."
    )
