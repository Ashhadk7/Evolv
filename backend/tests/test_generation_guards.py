"""Self-checks for the blueprint anti-hallucination guards.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_generation_guards.py
(Also discoverable by pytest as test_* functions if it's ever installed.)
"""
from __future__ import annotations

from app.services.generation.agents.product import DataEntity, Feature, ProductOutput, ProductPhase
from app.services.generation.enrichment import keep_cited_indexes
from app.services.generation.text import weeks_from_timeline
from app.services.refine_helpers import extract_features


def _feature(name: str, deps: list[str], priority: str) -> Feature:
    return Feature(
        name=name,
        module="Core",
        description="does a thing",
        userStory="As a user, I want x so that y",
        priority=priority,
        acceptanceCriteria=["Given a, when b, then c"],
        effort="S",
        dependencies=deps,
        addresses="a real persona pain",
    )


def _phase() -> ProductPhase:
    return ProductPhase(
        name="P", weeks=2, deliverables=["a", "b"], acceptanceCriteria=["done"], primarySkill="Backend"
    )


def _product(features: list[Feature]) -> ProductOutput:
    return ProductOutput(
        features=features,
        outOfScope=["x", "y"],
        dataEntities=[DataEntity(name="User", fields=["id", "email"]), DataEntity(name="Session", fields=["id", "userId"])],
        nonFunctional=["Auth required", "p95 < 300ms"],
        phases=[_phase(), _phase(), _phase()],
    )


def test_keep_cited_indexes_drops_out_of_range():
    assert keep_cited_indexes([1, 2, 7, 0, -1], 6) == [1, 2]
    assert keep_cited_indexes([], 6) == []
    assert keep_cited_indexes([1, 2, 3], 0) == []  # no sources shown → no valid citation


def test_dependency_validator_drops_phantom_and_self_refs():
    prod = _product([
        _feature("Login", ["Ghost", "Login"], "Must"),  # phantom + self → both dropped
        _feature("Signup", ["Login"], "Should"),          # valid ref → kept
        _feature("Profile", [], "Could"),
        _feature("Search", [], "Should"),
        _feature("Notify", [], "Could"),
        _feature("Export", [], "Should"),
    ])
    assert prod.features[0].dependencies == []
    assert prod.features[1].dependencies == ["Login"]


def test_prioritization_guards_reject_bad_specs():
    all_must = [_feature(n, [], "Must") for n in ("A", "B", "C", "D", "E", "F")]
    try:
        _product(all_must)
    except ValueError:
        pass
    else:
        raise AssertionError("all-Must spec should be rejected as unprioritized")


def test_weeks_from_timeline_anchors_the_build_budget():
    # The founder's timeline is what the frontend prices the build from — an
    # unparsed one (0) must mean "no constraint", never a short default.
    assert weeks_from_timeline("4 months") == 17
    assert weeks_from_timeline("6 weeks") == 6
    assert weeks_from_timeline("1 year") == 52
    assert weeks_from_timeline("3-6 months") == 26  # range -> outer bound
    assert weeks_from_timeline("ASAP") == 0
    assert weeks_from_timeline("") == 0


def test_extract_features_handles_structured_and_legacy_features():
    # Structured features would crash run_tech_stack's clean() as raw dicts.
    assert extract_features({"product": {"features": [{"name": "Login"}]}}) == ["Login"]
    assert extract_features({"product": {"features": ["Login"]}}) == ["Login"]
    assert extract_features({}) == []


def test_refine_call_sites_match_agent_signatures():
    # F4/F5 class: refine_service passes positional args to the agents. A
    # round-trip test can't catch an arg-count/name drift here — binding the
    # real signature to what refine passes does, before any network call.
    import inspect

    from app.services.generation.agents.product import run_product
    from app.services.generation.agents.scorecard import run_scorecard
    from app.services.generation.agents.strategy import run_strategy

    # refine_service._call_agent_for_section, section "synthesis"
    inspect.signature(run_scorecard).bind("brief", object(), object(), object(), "research", 3)
    # section "product"
    inspect.signature(run_product).bind("brief", "positioning", "persona", "research", 12)
    # section "strategy"
    inspect.signature(run_strategy).bind(object(), object(), "positioning", "research", "persona")


def test_chat_features_summary_handles_structured_and_legacy():
    # The assistant lost the whole feature list when features became objects:
    # _string_list kept only str items, so a dict feature summarised to nothing.
    from app.services.chat_service import _features

    assert _features([{"name": "Login", "module": "Accounts", "priority": "Must"}], 7) == [
        {"name": "Login", "module": "Accounts", "priority": "Must"}
    ]
    assert _features(["Legacy feature"], 7) == [{"name": "Legacy feature"}]  # founder-edited
    assert _features([{"module": "x"}], 7) == []  # no name → dropped, not a blank card
    assert _features(None, 7) == []


def test_market_output_round_trips_through_stored_json():
    # A stored blueprint must validate back into MarketOutput or refine silently
    # runs against an empty market analysis.
    from app.services.generation.agents.market import MarketOutput

    stored = MarketOutput(
        size="$500M", sizeBasis="sourced", cagr="18%", cagrBasis="assumption",
        customerCount=12000, customerCountBasis="source 2", priceAnnualUsd=600,
        priceBasis="benchmark", barriers="Moderate", score=70, demandLevel="High",
        timing="Now", whyNow="Rates dropped", insight="A wedge exists.",
        demandSignals=[{"text": "a", "sourceIndexes": [1]}, {"text": "b"}, {"text": "c"}],
        headwinds=["h1", "h2"], assumptions=["a1", "a2"], confidence="Medium",
        analysis="x" * 200, bottomUpSam="$7.2M",
    ).model_dump(by_alias=True)
    assert MarketOutput.model_validate(stored).bottom_up_sam == "$7.2M"


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            fn()
            print(f"ok  {name}")
    print("all guard checks passed")
