from __future__ import annotations

import re
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.services.generation.client import call_agent

PersonaSegment = Literal["Primary user", "Economic buyer", "Gatekeeper"]
ShortGoal = Annotated[str, Field(min_length=8, max_length=120)]
ShortPain = Annotated[str, Field(min_length=8, max_length=130)]
ShortTrigger = Annotated[str, Field(min_length=8, max_length=130)]
ShortObjection = Annotated[str, Field(min_length=8, max_length=130)]
ShortChannel = Annotated[str, Field(min_length=4, max_length=80)]
ShortRisk = Annotated[str, Field(min_length=8, max_length=140)]


class PersonaCard(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    segment: PersonaSegment
    name: str = Field(min_length=2, max_length=70)
    role: str = Field(min_length=3, max_length=90)
    context: str = Field(min_length=25, max_length=220)
    goals: list[ShortGoal] = Field(min_length=2, max_length=4)
    pains: list[ShortPain] = Field(min_length=2, max_length=4)
    jobs_to_be_done: list[ShortGoal] = Field(alias="jobsToBeDone", min_length=2, max_length=3)
    buying_triggers: list[ShortTrigger] = Field(alias="buyingTriggers", min_length=2, max_length=3)
    objections: list[ShortObjection] = Field(min_length=2, max_length=3)
    success_metric: str = Field(alias="successMetric", min_length=12, max_length=130)
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
    def require_expected_segments(self) -> "PersonaOutput":
        expected = {"Primary user", "Economic buyer", "Gatekeeper"}
        actual = {persona.segment for persona in self.personas}
        if actual != expected:
            raise ValueError("personas must include one Primary user, one Economic buyer, and one Gatekeeper.")
        if self.primary_persona not in actual:
            raise ValueError("primaryPersona must match one generated persona segment.")
        return self


PERSONA_SYSTEM_PROMPT = """You are Evolv's Persona Agent.
Create behavior-based customer personas for a startup blueprint.
Return exactly three personas: Primary user, Economic buyer, and Gatekeeper.
Do not use fake demographic stereotypes, real people, citations, or unverifiable claims.
Focus on jobs, pains, buying triggers, objections, and reachable channels.
The personas must help a founder make product, marketing, and sales decisions.
Keep every sentence short enough for dashboard cards.
Return JSON only."""


async def run_persona(idea: str, industry: str) -> PersonaOutput:
    idea = _clean(idea)
    industry = _clean(industry)
    if not idea:
        raise ValueError("Persona agent requires a startup idea.")
    if not industry:
        raise ValueError("Persona agent requires an industry/domain.")

    user_prompt = (
        f"Idea: {idea}\n"
        f"Industry: {industry}\n\n"
        "Generate exactly three practical personas for this startup's first realistic wedge. "
        "Each persona should be specific enough for founder-side product decisions but not tied to real people."
    )
    return await call_agent(
        PersonaOutput,
        PERSONA_SYSTEM_PROMPT,
        user_prompt,
        max_tokens=1200,
        retries=1,
    )


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()
