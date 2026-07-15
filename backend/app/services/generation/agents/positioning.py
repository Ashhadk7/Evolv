from __future__ import annotations

import re

from pydantic import BaseModel, ConfigDict, Field

from app.services.generation.client import call_agent


class PositioningOutput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    name: str = Field(min_length=2, max_length=64)
    differentiator: str = Field(min_length=12, max_length=150)
    mission: str = Field(min_length=20, max_length=180)
    vision: str = Field(min_length=20, max_length=180)
    problem: str = Field(min_length=25, max_length=240)
    solution: str = Field(min_length=25, max_length=240)
    value_prop: str = Field(alias="valueProp", min_length=20, max_length=180)
    revenue_model: str = Field(alias="revenueModel", min_length=20, max_length=180)


POSITIONING_SYSTEM_PROMPT = """You are Evolv's Positioning Agent.
Turn a founder's raw startup idea into concise, investor-ready positioning.
Write in a confident but practical startup-analysis tone.
Avoid hype, fake metrics, citations, and unverifiable claims.
Keep every field short enough for dashboard cards.
Return JSON only."""


async def run_positioning(idea: str, industry: str) -> PositioningOutput:
    """Generate positioning for the first wave of the blueprint pipeline.

    This function intentionally calls the configured Groq model instead of returning
    the fallback. The fallback stays exported for a later orchestrator-level safe mode.
    """

    idea = _clean(idea)
    industry = _clean(industry) or "Startup"
    if not idea:
        raise ValueError("Positioning agent requires a startup idea.")

    user_prompt = f"Idea: {idea}\nIndustry: {industry}"
    return await call_agent(
        PositioningOutput,
        POSITIONING_SYSTEM_PROMPT,
        user_prompt,
        retries=1,
    )


def build_fallback_positioning(idea: str, industry: str) -> PositioningOutput:
    idea = _clean(idea) or "A focused startup idea"
    industry = _clean(industry) or "Startup"
    name = _derive_name(idea, industry)
    customer = _customer_label(industry)
    outcome = _outcome_label(idea, industry)

    return PositioningOutput(
        name=name,
        differentiator=(
            f"A focused {industry} product that makes {outcome} faster, clearer, and easier to adopt."
        ),
        mission=(
            f"Help {customer} turn a painful workflow into a reliable digital process they can trust."
        ),
        vision=(
            f"Make modern {industry} capabilities accessible to teams that cannot afford slow, complex tools."
        ),
        problem=(
            f"{customer.capitalize()} still rely on fragmented tools, manual decisions, and slow handoffs "
            f"to manage {outcome}."
        ),
        solution=(
            f"{name} packages the core workflow into one guided platform with automation, clear outputs, "
            f"and practical next steps."
        ),
        valueProp=(
            f"Deliver measurable {industry} value sooner by reducing manual effort and improving decision clarity."
        ),
        revenueModel=(
            "Subscription tiers for teams, with usage-based add-ons once the core workflow proves repeatable."
        ),
    )


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def _derive_name(idea: str, industry: str) -> str:
    words = [
        word
        for word in re.findall(r"[A-Za-z0-9]+", idea)
        if word.lower() not in _STOP_WORDS and len(word) > 2
    ]
    if not words:
        return f"{industry[:40].strip().title()} Venture"

    selected = words[:3]
    if industry.lower() not in " ".join(selected).lower():
        selected.append(industry.split()[0])
    return " ".join(selected).title()[:64]


def _customer_label(industry: str) -> str:
    lookup = {
        "health": "clinical and care teams",
        "med": "clinical and care teams",
        "fin": "finance operators and small business teams",
        "ed": "educators and learning teams",
        "clean": "energy operators and sustainability teams",
        "logistics": "operations and delivery teams",
        "saas": "growing software teams",
        "ai": "teams adopting AI workflows",
    }
    lower = industry.lower()
    for key, label in lookup.items():
        if key in lower:
            return label
    return f"{industry.lower()} teams"


def _outcome_label(idea: str, industry: str) -> str:
    lower = f"{idea} {industry}".lower()
    if "diagnos" in lower or "health" in lower or "med" in lower:
        return "care decisions"
    if "learn" in lower or "school" in lower or "education" in lower:
        return "personalized learning"
    if "delivery" in lower or "logistics" in lower:
        return "delivery operations"
    if "finance" in lower or "payment" in lower:
        return "financial decisions"
    if "energy" in lower or "clean" in lower or "solar" in lower:
        return "energy operations"
    return "the core customer workflow"


_STOP_WORDS = {
    "that",
    "with",
    "from",
    "into",
    "using",
    "helps",
    "help",
    "platform",
    "system",
    "app",
    "tool",
    "for",
    "and",
    "the",
    "their",
    "your",
    "our",
}


FALLBACK_POSITIONING = build_fallback_positioning(
    "A platform that helps teams validate and launch startup ideas",
    "SaaS",
)
