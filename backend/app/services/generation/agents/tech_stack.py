from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.services.generation.agent_service import call_agent
from app.services.generation.prompt_loader import load_prompt, render_prompt
from app.services.generation.text import clean

ShortReasoning = Annotated[str, Field(min_length=1, max_length=180)]
MonthlyCost = Annotated[str, Field(min_length=1, max_length=40)]
RoleSkills = Annotated[str, Field(min_length=1, max_length=140)]


class TechStackLayer(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    chosen: str = Field(min_length=1, max_length=70)
    reasoning: ShortReasoning
    monthly_cost: MonthlyCost = Field(alias="monthlyCost")


class TechStackPlan(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    frontend: TechStackLayer
    backend: TechStackLayer
    database: TechStackLayer
    vector_db: TechStackLayer = Field(alias="vectorDb")
    ai_provider: TechStackLayer = Field(alias="aiProvider")
    hosting: TechStackLayer


class TechRole(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    role: str = Field(min_length=1, max_length=80)
    count: int = Field(ge=1, le=3)
    skills: RoleSkills
    lead: bool


class TechStackOutput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    tech_stack: TechStackPlan = Field(alias="techStack")
    roles: list[TechRole] = Field(min_length=3, max_length=5)


async def run_tech_stack(idea: str, industry: str, features: list[str]) -> TechStackOutput:
    idea = clean(idea)
    industry = clean(industry)
    cleaned_features = [clean(feature) for feature in features]
    cleaned_features = [feature for feature in cleaned_features if feature]
    if not idea:
        raise ValueError("Tech Stack agent requires a startup idea.")
    if not industry:
        raise ValueError("Tech Stack agent requires an industry/domain.")
    if not cleaned_features:
        raise ValueError("Tech Stack agent requires product features.")

    return await call_agent(
        TechStackOutput,
        load_prompt("tech_stack"),
        render_prompt(
            "tech_stack_user",
            idea=idea,
            industry=industry,
            features="\n".join(f"- {feature}" for feature in cleaned_features),
        ),
        max_tokens=1100,
    )
