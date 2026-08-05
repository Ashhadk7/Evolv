"""Scores a public blueprint against one developer.

The inverse of `matching_service`, which scores developers against a blueprint
role. Both directions share `matching_service`'s skill/experience/availability
weights on purpose: a founder and a developer looking at the same pairing must
see the same number, and they cannot if each side invents its own formula.
"""

from __future__ import annotations

import re
from collections.abc import Iterable
from dataclasses import dataclass, field

from app.models.blueprint import LevelRating
from app.models.user import DeveloperProfile
from app.services.matching_service import (
    AVAILABILITY_WEIGHT,
    EXPERIENCE_CAP_YEARS,
    EXPERIENCE_WEIGHT,
    SKILL_WEIGHT,
)

ROLE_FIT_WEIGHT = 0.70
STACK_FIT_WEIGHT = 0.20
CONTEXT_WEIGHT = 0.10

RULE_WEIGHT = 0.5
SEMANTIC_WEIGHT = 0.5

INDUSTRY_CONTEXT_WEIGHT = 0.5
VIABILITY_CONTEXT_WEIGHT = 0.3
DEMAND_CONTEXT_WEIGHT = 0.2

DEMAND_STRENGTH = {LevelRating.HIGH: 1.0, LevelRating.MEDIUM: 0.6, LevelRating.LOW: 0.2}

UNAVAILABLE_PENALTY = 0.6
MAX_REASONS = 4
MAX_SKILLS_TO_PICK_UP = 3

# Skill coverage is divided by at least this many skills, so a role listing two
# requirements cannot beat one listing eight on a single lucky match. A thin
# skill list is weak evidence of fit, not proof of it.
MIN_ROLE_SKILLS_FOR_FULL_CREDIT = 4

STRONG_FIT_THRESHOLD = 80
GOOD_FIT_THRESHOLD = 60


@dataclass(frozen=True)
class RoleFit:
    role: str
    fit: int


@dataclass(frozen=True)
class BlueprintScore:
    """A None score means "not enough profile to judge", not zero.

    Showing a low number to a developer who simply has not listed skills yet
    reads as a rejection. The UI prompts them to finish their profile instead.
    """

    score: int | None
    fit_label: str | None
    best_role: str | None
    role_fits: list[RoleFit] = field(default_factory=list)
    matched_skills: list[str] = field(default_factory=list)
    skills_to_pick_up: list[str] = field(default_factory=list)
    reasons: list[str] = field(default_factory=list)


def blueprint_profile_text(
    industry: str, roles: Iterable[object], tech_stack: Iterable[str]
) -> str:
    """Text embedded for a blueprint, at index time and at query time alike.

    Deliberately narrow: role titles, role skills, stack and industry. Folding
    in market or financial prose would dilute the skills signal the developer
    is actually being matched on.
    """
    role_titles = [getattr(role, "role", "") for role in roles]
    role_skills = [skill for role in roles for skill in getattr(role, "skills", [])]
    parts = [industry, *role_titles, *role_skills, *tech_stack]
    return ", ".join(part for part in parts if part)


def developer_profile_text(developer: DeveloperProfile) -> str:
    parts = [
        developer.job_title or "",
        *(developer.skills or []),
        *(developer.tags or []),
    ]
    return ", ".join(part for part in parts if part)


def score_blueprint(
    *,
    developer: DeveloperProfile,
    industry: str,
    viability: int,
    developer_demand: LevelRating,
    roles: list,
    tech_stack: list[str],
    semantic_similarity: float | None = None,
) -> BlueprintScore:
    developer_skills = dedupe(developer.skills or [])
    if not developer_skills:
        return BlueprintScore(
            score=None,
            fit_label=None,
            best_role=None,
            reasons=["Add skills to your profile to see how well this blueprint matches you."],
        )

    role_fits = _role_fits(developer, developer_skills, roles, tech_stack)
    best = max(role_fits, key=lambda item: item.fit, default=None)
    best_role_fraction = (best.fit / 100) if best else 0.0

    stack_fit = _coverage(developer_skills, tech_stack)
    industry_match = _industry_match(developer, industry)
    context = (
        INDUSTRY_CONTEXT_WEIGHT * (1.0 if industry_match else 0.0)
        + VIABILITY_CONTEXT_WEIGHT * (viability / 100)
        + DEMAND_CONTEXT_WEIGHT * DEMAND_STRENGTH.get(developer_demand, 0.0)
    )

    rule_score = 100 * (
        ROLE_FIT_WEIGHT * best_role_fraction
        + STACK_FIT_WEIGHT * stack_fit
        + CONTEXT_WEIGHT * context
    )
    if semantic_similarity is None:
        blended = rule_score
    else:
        blended = RULE_WEIGHT * rule_score + SEMANTIC_WEIGHT * (semantic_similarity * 100)
    score = max(0, min(100, round(blended)))

    relevant_skills = _relevant_skills(roles, tech_stack, best)
    matched_skills = matching_terms(developer_skills, relevant_skills)
    skills_to_pick_up = _skill_gaps(matched_skills, relevant_skills)

    return BlueprintScore(
        score=score,
        fit_label=_fit_label(score),
        best_role=best.role if best else None,
        role_fits=role_fits,
        matched_skills=matched_skills,
        skills_to_pick_up=skills_to_pick_up,
        reasons=_reasons(
            matched_skills=matched_skills,
            required_count=len(relevant_skills),
            best=best,
            industry=industry if industry_match else None,
            developer_demand=developer_demand,
            viability=viability,
        ),
    )


def _role_fits(
    developer: DeveloperProfile,
    developer_skills: list[str],
    roles: list,
    tech_stack: list[str],
) -> list[RoleFit]:
    experience = min((developer.experience_years or 0) / EXPERIENCE_CAP_YEARS, 1.0)
    availability = 1.0 if developer.availability else UNAVAILABLE_PENALTY

    fits: list[RoleFit] = []
    for role in roles:
        required = role.skills or tech_stack
        weighted = (
            SKILL_WEIGHT * _role_coverage(developer_skills, required)
            + EXPERIENCE_WEIGHT * experience
            + AVAILABILITY_WEIGHT * availability
        )
        fits.append(RoleFit(role=role.role, fit=round(weighted * 100)))
    return fits


def _relevant_skills(roles: list, tech_stack: list[str], best: RoleFit | None) -> list[str]:
    """Skills for the role this developer would actually apply for, plus the stack.

    Pooling every role's skills instead would tell a backend engineer to go and
    learn Figma because the founder also needs a designer.
    """
    best_role_skills = next(
        (role.skills for role in roles if best is not None and role.role == best.role), []
    )
    return dedupe([*best_role_skills, *tech_stack])


def _skill_gaps(matched_skills: list[str], relevant_skills: list[str]) -> list[str]:
    """Unmet skills, collapsed so "Node" and "Node.js" cannot both appear."""
    matched_keys = {normal_key(skill) for skill in matched_skills}
    gaps: list[str] = []
    for skill in relevant_skills:
        if normal_key(skill) in matched_keys or matching_terms([skill], gaps):
            continue
        gaps.append(skill)
        if len(gaps) == MAX_SKILLS_TO_PICK_UP:
            break
    return gaps


def _coverage(developer_skills: list[str], required_skills: list[str]) -> float:
    if not required_skills:
        return 0.0
    return len(matching_terms(developer_skills, required_skills)) / len(required_skills)


def _role_coverage(developer_skills: list[str], required_skills: list[str]) -> float:
    """Coverage that accounts for how much the role actually asks for.

    Plain coverage rates 1-of-2 the same as 4-of-8, which lets a role with a
    two-line skill list outrank a fully specified one on a single match.
    """
    if not required_skills:
        return 0.0
    denominator = max(len(required_skills), MIN_ROLE_SKILLS_FOR_FULL_CREDIT)
    return len(matching_terms(developer_skills, required_skills)) / denominator


def _industry_match(developer: DeveloperProfile, industry: str) -> bool:
    if not industry:
        return False
    haystack = normal_key(
        " ".join(filter(None, [developer.job_title, developer.bio, *(developer.tags or [])]))
    )
    return normal_key(industry) in haystack


def _fit_label(score: int) -> str:
    if score >= STRONG_FIT_THRESHOLD:
        return "Strong fit for you"
    if score >= GOOD_FIT_THRESHOLD:
        return "Good fit for you"
    return "Partial fit"


def _reasons(
    *,
    matched_skills: list[str],
    required_count: int,
    best: RoleFit | None,
    industry: str | None,
    developer_demand: LevelRating,
    viability: int,
) -> list[str]:
    """Only states what actually moved the score, so the explanation stays honest."""
    reasons: list[str] = []
    if matched_skills:
        reasons.append(f"You know {', '.join(matched_skills[:4])}")
    if required_count:
        reasons.append(f"{len(matched_skills)} of {required_count} required skills met")
    if best is not None:
        reasons.append(f"{best.role} is your strongest role here at {best.fit}%")
    if industry:
        reasons.append(f"Matches your {industry} background")
    if developer_demand == LevelRating.HIGH:
        reasons.append("High developer demand in the build plan")
    if viability >= 80:
        reasons.append("Strong blueprint viability")
    return reasons[:MAX_REASONS]


def matching_terms(source: list[str], candidates: list[str]) -> list[str]:
    """Substring match in both directions so "React" matches "React.js"."""
    normalized_source = [normal_key(item) for item in source]
    matched = [
        candidate
        for candidate in candidates
        if (key := normal_key(candidate))
        and any(key in source_key or source_key in key for source_key in normalized_source)
    ]
    return dedupe(matched)


def dedupe(values: Iterable[object]) -> list[str]:
    seen: set[str] = set()
    items: list[str] = []
    for raw in values:
        value = str(raw).strip()
        key = normal_key(value)
        if value and key and key not in seen:
            seen.add(key)
            items.append(value)
    return items


def sorted_unique(values: Iterable[object]) -> list[str]:
    return sorted(dedupe(values), key=str.lower)


def normal_key(value: object) -> str:
    return re.sub(r"[^a-z0-9+#.]+", " ", str(value).lower()).strip()
