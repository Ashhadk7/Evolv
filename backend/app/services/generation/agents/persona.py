from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.services.generation.client import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean

PersonaSegment = Literal["Primary user", "Economic buyer", "Gatekeeper"]
ShortGoal = Annotated[str, Field(min_length=1, max_length=120)]
ShortPain = Annotated[str, Field(min_length=1, max_length=130)]
ShortTrigger = Annotated[str, Field(min_length=1, max_length=130)]
ShortObjection = Annotated[str, Field(min_length=1, max_length=130)]
ShortChannel = Annotated[str, Field(min_length=1, max_length=80)]
ShortRisk = Annotated[str, Field(min_length=1, max_length=140)]


class PersonaCard(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    segment: PersonaSegment
    name: str = Field(min_length=1, max_length=70)
    role: str = Field(min_length=1, max_length=90)
    context: str = Field(min_length=1, max_length=220)
    goals: list[ShortGoal] = Field(min_length=2, max_length=4)
    pains: list[ShortPain] = Field(min_length=2, max_length=4)
    jobs_to_be_done: list[ShortGoal] = Field(alias="jobsToBeDone", min_length=2, max_length=3)
    buying_triggers: list[ShortTrigger] = Field(alias="buyingTriggers", min_length=2, max_length=3)
    objections: list[ShortObjection] = Field(min_length=2, max_length=3)
    success_metric: str = Field(alias="successMetric", min_length=1, max_length=130)
    acquisition_channels: list[ShortChannel] = Field(
        alias="acquisitionChannels", min_length=2, max_length=4
    )


class PersonaOutput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    personas: list[PersonaCard] = Field(min_length=3, max_length=3)
    primary_persona: PersonaSegment = Field(alias="primaryPersona")
    adoption_path: list[ShortTrigger] = Field(alias="adoptionPath", min_length=3, max_length=5)
    messaging_angles: list[ShortGoal] = Field(alias="messagingAngles", min_length=2, max_length=4)
    risk_notes: list[ShortRisk] = Field(alias="riskNotes", min_length=2, max_length=4)
    confidence: Literal["High", "Medium", "Low"]

    @model_validator(mode="after")
    def require_expected_segments(self) -> PersonaOutput:
        expected = {"Primary user", "Economic buyer", "Gatekeeper"}
        actual = {persona.segment for persona in self.personas}
        if actual != expected:
            raise ValueError(
                "personas must include one Primary user, one Economic buyer, and one Gatekeeper."
            )
        if self.primary_persona not in actual:
            raise ValueError("primaryPersona must match one generated persona segment.")
        return self


async def run_persona(idea: str, industry: str) -> PersonaOutput:
    idea = clean(idea)
    industry = clean(industry)
    if not idea:
        raise ValueError("Persona agent requires a startup idea.")
    if not industry:
        raise ValueError("Persona agent requires an industry/domain.")

    return await call_agent(
        PersonaOutput,
        load_prompt("persona"),
        render_prompt("persona_user", idea=idea, industry=industry),
        max_tokens=1200,
    )
