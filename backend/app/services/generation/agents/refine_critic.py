from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.services.generation.agent_service import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt


class RefineVerdict(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    verdict: Literal["proceed", "block"]
    reason: str = Field(min_length=1, max_length=300)


async def run_refine_critic(section: str, feedback: str) -> RefineVerdict:
    return await call_agent(
        RefineVerdict,
        load_prompt("refine_critic"),
        render_prompt("refine_critic_user", section=section, feedback=feedback),
        max_tokens=300,
    )
