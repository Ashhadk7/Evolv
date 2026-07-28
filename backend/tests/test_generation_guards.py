"""Self-checks for the blueprint anti-hallucination guards.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_generation_guards.py
(Also discoverable by pytest as test_* functions if it's ever installed.)
"""
from __future__ import annotations

from app.services.generation.agents.product import DataEntity, Feature, ProductOutput, ProductPhase
from app.services.generation.enrichment import keep_cited_indexes


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


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            fn()
            print(f"ok  {name}")
    print("all guard checks passed")
