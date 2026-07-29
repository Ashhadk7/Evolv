from __future__ import annotations

from typing import Any, Literal, get_args

from pydantic import BaseModel, ConfigDict, Field

from app.services.generation.agent_service import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt

IntakeField = Literal[
    "idea",
    "industry",
    "target_customer",
    "problem",
    "solution",
    "stage",
    "budget",
    "timeline",
    "region",
    "monetization",
    "constraints",
]

INTAKE_FIELDS: tuple[str, ...] = get_args(IntakeField)


class FieldGap(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    field: IntakeField
    issue: str = Field(min_length=1, max_length=160)
    question: str = Field(min_length=1, max_length=160)
    suggestion: str = Field(min_length=1, max_length=200)


class IntakeConflict(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    fields: list[IntakeField] = Field(min_length=2, max_length=3)
    conflict: str = Field(min_length=1, max_length=220)
    question: str = Field(min_length=1, max_length=160)


class IntakeVerdict(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    verdict: Literal["proceed", "ask", "block"]
    reason: str = Field(min_length=1, max_length=300)
    gaps: list[FieldGap] = Field(default_factory=list, max_length=4)
    conflicts: list[IntakeConflict] = Field(default_factory=list, max_length=3)


def render_intake(intake: dict[str, Any]) -> str:
    return "\n".join(
        f"{field}: {intake.get(field) or '(not provided)'}" for field in INTAKE_FIELDS
    )


async def run_intake_critic(intake: dict[str, Any]) -> IntakeVerdict:
    return await call_agent(
        IntakeVerdict,
        load_prompt("intake_critic"),
        render_prompt("intake_critic_user", intake=render_intake(intake)),
        max_tokens=900,
    )
