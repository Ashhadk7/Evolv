"""Self-checks for developer-facing blueprint scoring.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_discover_scoring.py
(Also discoverable by pytest as test_* functions if it's ever installed.)
"""
from __future__ import annotations

from app.models.blueprint import LevelRating
from app.models.user import DeveloperProfile
from app.schemas.discover import DiscoverBlueprintRole
from app.services import discover_scoring


def _developer(
    skills: list[str],
    *,
    job_title: str = "Full-stack Developer",
    bio: str = "",
    experience_years: int = 4,
    availability: bool = True,
    tags: list[str] | None = None,
) -> DeveloperProfile:
    return DeveloperProfile(
        job_title=job_title,
        bio=bio,
        experience_years=experience_years,
        availability=availability,
        skills=skills,
        tags=tags or [],
    )


def _role(role: str, skills: list[str]) -> DiscoverBlueprintRole:
    return DiscoverBlueprintRole(role=role, count=1, skills=skills, lead=False)


def _score(developer: DeveloperProfile, **overrides):
    kwargs = {
        "industry": "HealthTech",
        "viability": 80,
        "developer_demand": LevelRating.HIGH,
        "roles": [
            _role("Full-stack Engineer", ["Node", "TypeScript", "React"]),
            _role("Product Designer", ["Figma", "UX"]),
        ],
        "tech_stack": ["Node.js", "React", "PostgreSQL"],
    }
    kwargs.update(overrides)
    return discover_scoring.score_blueprint(developer=developer, **kwargs)


def test_no_skills_yields_no_score_rather_than_a_low_one():
    result = _score(_developer([]))
    assert result.score is None
    assert result.best_role is None
    assert result.fit_label is None
    assert result.reasons  # still explains why there is no score


def test_best_role_is_the_strongest_not_the_average():
    result = _score(_developer(["Node", "TypeScript", "React"]))
    assert result.best_role == "Full-stack Engineer"
    fits = {fit.role: fit.fit for fit in result.role_fits}
    assert fits["Full-stack Engineer"] > fits["Product Designer"]


def test_skills_to_pick_up_covers_the_best_role_not_every_role():
    result = _score(_developer(["React"]))
    assert "React" not in result.skills_to_pick_up
    assert "TypeScript" in result.skills_to_pick_up
    # Figma belongs to the designer role this developer would never apply for.
    assert "Figma" not in result.skills_to_pick_up


def test_skill_gaps_collapse_naming_variants():
    result = _score(
        _developer(["Python"]),
        roles=[_role("Backend Engineer", ["Node"])],
        tech_stack=["Node.js"],
    )
    assert result.skills_to_pick_up == ["Node"]


def test_fuzzy_skill_match_across_naming_variants():
    result = _score(_developer(["Node.js"]))
    assert discover_scoring.matching_terms(["Node.js"], ["Node"]) == ["Node"]
    assert "Node" in result.matched_skills


def test_semantic_similarity_blends_but_never_leaves_range():
    rule_only = _score(_developer(["Node", "TypeScript", "React"]))
    blended = _score(_developer(["Node", "TypeScript", "React"]), semantic_similarity=1.0)
    assert rule_only.score is not None and blended.score is not None
    assert blended.score > rule_only.score
    assert 0 <= blended.score <= 100

    floored = _score(_developer(["Node"]), semantic_similarity=0.0)
    assert floored.score is not None and 0 <= floored.score <= 100


def test_similarity_is_all_or_nothing_across_a_result_set():
    from uuid import uuid4

    from app.services.discover_service import _similarity_for

    indexed, missing = uuid4(), uuid4()
    similarities = {str(indexed): 0.9}

    assert _similarity_for(similarities, indexed) == 0.9
    # Outside Pinecone's top-k means a weak match, not an unknown one. Falling
    # back to rule-only here would rank it above blueprints the blend pulled down.
    assert _similarity_for(similarities, missing) == 0.0
    assert _similarity_for({}, indexed) is None


def test_a_thin_role_cannot_outrank_a_fully_specified_one():
    # 1-of-2 must not beat 4-of-8: a two-line skill list is weak evidence of fit.
    result = _score(
        _developer(["Node", "TypeScript", "React", "PostgreSQL"]),
        roles=[
            _role("Full-stack Developer", ["Node", "TypeScript", "React", "PostgreSQL",
                                           "Redis", "Kafka", "Terraform", "Go"]),
            _role("POS Integration Specialist", ["Toast POS API", "Node"]),
        ],
    )
    fits = {fit.role: fit.fit for fit in result.role_fits}
    assert fits["Full-stack Developer"] > fits["POS Integration Specialist"]
    assert result.best_role == "Full-stack Developer"


def test_rescaling_spreads_similarities_and_drops_a_flat_signal():
    from app.services.discover_service import _rescale

    spread = _rescale({"a": 0.87, "b": 0.89, "c": 0.91})
    assert spread == {"a": 0.0, "b": 0.5, "c": 1.0}

    # Identical cosines carry no comparative information, so semantic scoring is
    # dropped rather than amplified into an arbitrary ordering.
    assert _rescale({"a": 0.9, "b": 0.9}) == {}


def test_filter_options_rank_by_use_not_alphabet():
    from app.services.discover_service import _most_used_tech

    stacks = [["React", "PostgreSQL"], ["React", "Zulu"], ["React"], ["Aardvark", "PostgreSQL"]]
    options = _most_used_tech(stacks)

    # Alphabetical truncation used to drop React entirely in favour of whatever
    # sorted first, leaving developers unable to filter by common stacks.
    assert "React" in options
    assert "PostgreSQL" in options
    assert options == sorted(options, key=str.lower)


def test_placeholder_layers_never_reach_the_ui():
    from app.services.discover_service import _extract_tech_stack, _split_skills

    tech_agent = {
        "techStack": {
            "frontend": {"chosen": "React"},
            "vectorDb": {"chosen": "None"},
            "aiProvider": {"chosen": "N/A"},
        }
    }
    assert _extract_tech_stack(tech_agent) == ["React"]
    assert _split_skills("React, None, TBD, Node") == ["React", "Node"]


def test_only_failed_and_generating_blueprints_are_withheld():
    from app.services.discover_service import UNFINISHED_STATUSES

    assert "failed" in UNFINISHED_STATUSES
    assert "generating" in UNFINISHED_STATUSES
    # "completed" and blueprints predating generation tracking (no status at all)
    # must stay visible, or legitimate published work disappears from Discover.
    assert "completed" not in UNFINISHED_STATUSES
    assert "" not in UNFINISHED_STATUSES


def test_unavailable_developer_scores_below_an_identical_available_one():
    available = _score(_developer(["Node", "TypeScript", "React"]))
    busy = _score(_developer(["Node", "TypeScript", "React"], availability=False))
    assert available.score is not None and busy.score is not None
    assert busy.score < available.score


def test_role_without_listed_skills_falls_back_to_the_stack():
    result = _score(
        _developer(["React", "Node.js", "PostgreSQL"]),
        roles=[_role("Unspecified Role", [])],
    )
    fits = {fit.role: fit.fit for fit in result.role_fits}
    assert fits["Unspecified Role"] > 0


def test_industry_affinity_only_counts_when_the_profile_says_so():
    generic = _score(_developer(["React"]))
    aligned = _score(_developer(["React"], bio="Five years building healthtech products."))
    assert aligned.score is not None and generic.score is not None
    assert aligned.score > generic.score


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            fn()
            print(f"ok  {name}")
    print("all discover scoring checks passed")
