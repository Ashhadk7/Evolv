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

    from app.services.generation.agents.persona import run_persona
    from app.services.generation.agents.product import run_product
    from app.services.generation.agents.scorecard import run_scorecard
    from app.services.generation.agents.strategy import run_strategy

    # refine_service._call_agent_for_section, section "synthesis"
    inspect.signature(run_scorecard).bind("brief", object(), object(), object(), "research", 3)
    # section "product"
    inspect.signature(run_product).bind("brief", "positioning", "persona", "research", 12)
    # section "strategy"
    inspect.signature(run_strategy).bind(object(), object(), "positioning", "research", "persona", 3)
    # section "persona"
    inspect.signature(run_persona).bind("brief", "industry", "research", 3)


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


def test_verify_grounding_downgrades_unsupported_sourced_claims():
    from types import SimpleNamespace

    from app.services.generation.agents.common import verify_grounding

    unsupported = SimpleNamespace(basis="sourced", source_indexes=[])
    verify_grounding(unsupported, 5)
    assert unsupported.basis == "assumption"

    partly_valid = SimpleNamespace(basis="sourced", source_indexes=[2, 9])
    verify_grounding(partly_valid, 5)
    assert partly_valid.source_indexes == [2]
    assert partly_valid.basis == "sourced"

    all_fabricated = SimpleNamespace(basis="sourced", source_indexes=[9, 12])
    verify_grounding(all_fabricated, 5)
    assert all_fabricated.source_indexes == []
    assert all_fabricated.basis == "assumption"


def test_market_output_round_trips_through_stored_json():
    # A stored blueprint must validate back into MarketOutput or refine silently
    # runs against an empty market analysis.
    from app.services.generation.agents.market import MarketOutput

    stored = MarketOutput(
        size="$500M", sizeBasis="sourced", cagr="18%", cagrBasis="assumption",
        customerCount=12000, customerCountBasis="source 2", priceAnnualUsd=600,
        priceBasis="benchmark", barriers="Moderate", demandLevel="High",
        timing="Now", whyNow="Rates dropped", insight="A wedge exists.",
        demandSignals=[{"text": "a", "sourceIndexes": [1]}, {"text": "b"}, {"text": "c"}],
        headwinds=["h1", "h2"], assumptions=["a1", "a2"], confidence="Medium",
        analysis="x" * 200, bottomUpSam="$7.2M",
    ).model_dump(by_alias=True)
    assert MarketOutput.model_validate(stored).bottom_up_sam == "$7.2M"


def test_intake_critic_shows_empty_fields_to_the_model():
    from app.services.generation.agents.intake_critic import INTAKE_FIELDS, render_intake

    block = render_intake({"idea": "A booking tool for Lahore dental clinics", "problem": ""})
    assert "idea: A booking tool for Lahore dental clinics" in block
    assert "problem: (not provided)" in block
    assert len(block.splitlines()) == len(INTAKE_FIELDS)


def test_intake_rejection_carries_the_verdict_to_the_client():
    from app.services.exceptions import ErrorCode, IntakeRejectedError
    from app.services.generation.agents.intake_critic import IntakeVerdict

    verdict = IntakeVerdict(
        verdict="ask",
        reason="The problem describes a pain the idea does not address.",
        gaps=[
            {
                "field": "target_customer",
                "issue": "No segment named",
                "question": "Who specifically would use this?",
                "suggestion": "Name a job title or business type, not a general audience.",
            }
        ],
        conflicts=[
            {
                "fields": ["idea", "problem"],
                "conflict": "Idea is restaurant pricing; problem is patient wait times.",
                "question": "Which one is the venture?",
            }
        ],
    )
    error = IntakeRejectedError(verdict)
    assert error.code is ErrorCode.INTAKE_REJECTED
    assert error.message == verdict.reason
    assert error.extra["intake"]["verdict"] == "ask"
    assert error.extra["intake"]["conflicts"][0]["fields"] == ["idea", "problem"]
    assert error.extra["intake"]["gaps"][0]["field"] == "target_customer"


def test_start_generation_gates_before_persisting():
    import inspect

    from app.services.generation import blueprint_generation_service as service

    assert inspect.iscoroutinefunction(service.start_generation)
    body = inspect.getsource(service.start_generation)
    assert body.index("run_intake_critic") < body.index("create_blueprint")


def _expect_rejected(build, label: str):
    try:
        build()
    except ValueError:
        return
    raise AssertionError(label)


def test_dependency_cycles_are_rejected():
    cyclic = [
        _feature("Payments", ["Wallet"], "Must"),
        _feature("Wallet", ["Payments"], "Should"),
        _feature("Profile", [], "Could"),
        _feature("Search", [], "Should"),
        _feature("Notify", [], "Could"),
        _feature("Export", [], "Should"),
    ]
    _expect_rejected(lambda: _product(cyclic), "A->B->A dependency cycle should be rejected")


def test_phase_weeks_must_match_the_founder_timeline():
    from app.services.generation.agents.product import _fits_timeline

    spec = _product([_feature(n, [], "Must" if n == "A" else "Should") for n in "ABCDEF"])
    assert sum(p.weeks for p in spec.phases) == 6

    assert _fits_timeline(0) is None
    _fits_timeline(7)(spec)
    _expect_rejected(
        lambda: _fits_timeline(17)(spec), "a 6-week roadmap on a 17-week timeline should fail"
    )


def test_market_figures_must_be_machine_readable():
    from app.services.generation.agents.market import MarketAnalysis

    def build(size: str, cagr: str):
        return MarketAnalysis(
            size=size, sizeBasis="sourced", cagr=cagr, cagrBasis="assumption",
            customerCount=1200, customerCountBasis="src 1", priceAnnualUsd=600,
            priceBasis="bench", barriers="Moderate", demandLevel="High",
            timing="Now", whyNow="Shift", insight="A wedge exists.",
            demandSignals=[{"text": "a"}, {"text": "b"}, {"text": "c"}],
            headwinds=["h1", "h2"], assumptions=["a1", "a2"], confidence="Medium",
            analysis="x" * 200,
        )

    assert build("$500M", "18%").size == "$500M"
    assert build("$1,200", "-3.5%").cagr == "-3.5%"
    _expect_rejected(lambda: build("roughly half a billion", "18%"), "prose size should fail")
    _expect_rejected(lambda: build("$500M", "high growth"), "prose cagr should fail")


def test_developer_rate_parsing_covers_real_profile_text():
    from app.services.developer_rates import median_weekly_usd, parse_rate

    pkr = parse_rate("PKR 80,000/month")
    assert (pkr.amount, pkr.period, pkr.currency) == (80000, "month", "PKR")
    usd = parse_rate("$5k")
    assert (usd.amount, usd.period, usd.currency) == (5000, "month", "USD")
    hourly = parse_rate("$45 / hr")
    assert (hourly.amount, hourly.period, hourly.currency) == (45, "hour", "USD")

    assert parse_rate("negotiable") is None
    assert parse_rate("") is None
    assert parse_rate(None) is None

    assert round(parse_rate("$45/hr").weekly_usd()) == 1800
    assert median_weekly_usd([]) is None
    rates = [parse_rate("$40/hr"), parse_rate("$60/hr"), parse_rate("$200/hr")]
    assert median_weekly_usd(rates) == 2400


def test_every_stored_profile_column_reaches_the_api():
    from app.schemas.developer_profiles import DeveloperProfileBase, DeveloperProfileResponse
    from app.schemas.users import PublicDeveloperProfile
    from app.services.developer_profiles import stored_profile_fields

    stored = set(DeveloperProfileBase.model_fields)
    for response in (DeveloperProfileResponse, PublicDeveloperProfile):
        missing = stored - set(response.model_fields)
        assert not missing, f"{response.__name__} drops {missing}"

    from types import SimpleNamespace

    blank = {name: None for name in stored}
    blank.update(availability=True, open_to_remote=False, skills=[], profile_complete=False)
    projected = stored_profile_fields(SimpleNamespace(**blank))
    assert set(projected) == stored - {"profile_complete"}


def test_rate_of_prefers_structured_columns_then_legacy_text():
    from types import SimpleNamespace

    from app.services.developer_rates import rate_of

    structured = SimpleNamespace(
        rate_amount=900, rate_period="week", rate_currency="USD", preferred_budget="$5k"
    )
    assert rate_of(structured).amount == 900

    legacy = SimpleNamespace(
        rate_amount=None, rate_period=None, rate_currency=None,
        preferred_budget="PKR 80,000/month",
    )
    fallback = rate_of(legacy)
    assert (fallback.amount, fallback.currency) == (80000, "PKR")

    blank = SimpleNamespace(
        rate_amount=None, rate_period=None, rate_currency=None, preferred_budget="negotiable"
    )
    assert rate_of(blank) is None


def test_rate_card_falls_back_when_nobody_matches():
    from app.services.generation.blueprint_generation_service import _build_rate_card
    from app.services.generation.agents.tech_stack import TechRole, TechStackOutput

    layer = {"chosen": "x", "reasoning": "y", "monthlyCost": "$0"}
    stack = TechStackOutput(
        techStack={key: layer for key in
                   ("frontend", "backend", "database", "vectorDb", "aiProvider", "hosting")},
        roles=[
            TechRole(role="Backend", count=1, skills="Python, FastAPI", lead=True),
            TechRole(role="Frontend", count=1, skills="React", lead=False),
            TechRole(role="QA", count=1, skills="Playwright", lead=False),
        ],
    )

    from sqlalchemy.exc import SQLAlchemyError

    class NoDb:
        def scalars(self, *args, **kwargs):
            raise SQLAlchemyError("no database here")

    card = _build_rate_card(NoDb(), stack)
    assert card == {"anchorWeeklyUsd": None, "sampleSize": 0, "basis": "default"}


def test_industry_match_alone_is_not_researching_the_idea():
    from app.services.generation.enrichment import ResearchSource, _filter_relevant, _tokens

    def source(title: str) -> ResearchSource:
        return ResearchSource(
            provider="tavily", kind="web", title=title,
            url=f"https://x.io/{abs(hash(title))}", snippet=title, domain="x.io", publishedAt="",
        )

    idea = _tokens("marketplace matching Karachi rooftop owners with solar installers")
    industry = _tokens("CleanTech")

    generic = [source("Global CleanTech investment trends 2026")]
    kept, matched = _filter_relevant(generic, idea, industry)
    assert kept == generic
    assert matched is False

    specific = [source("Karachi rooftop solar installers marketplace launches")]
    kept, matched = _filter_relevant(specific, idea, industry)
    assert matched is True

    unrelated = [source("Unrelated cooking blog about pasta")]
    kept, matched = _filter_relevant(unrelated, idea, industry)
    assert kept == unrelated
    assert matched is False


def test_unresearched_idea_forces_low_confidence():
    from types import SimpleNamespace

    from app.services.generation.enrichment import ResearchBundle, downgrade_when_unresearched

    def bundle(matched: bool) -> ResearchBundle:
        return ResearchBundle(kind="market", generatedAt="now", matchedIdea=matched)

    confident = SimpleNamespace(confidence="High")
    downgrade_when_unresearched(confident, bundle(False))
    assert confident.confidence == "Low"

    researched = SimpleNamespace(confidence="High")
    downgrade_when_unresearched(researched, bundle(True))
    assert researched.confidence == "High"

    assert bundle(False).to_metadata()["matchedIdea"] is False


def test_market_no_longer_carries_a_rival_score():
    from app.services.generation.agents.market import MarketAnalysis

    assert "score" not in MarketAnalysis.model_fields


def test_tech_stack_is_sized_on_committed_features_only():
    from app.services.generation.blueprint_generation_service import _committed_features

    spec = _product([
        _feature("Login", [], "Must"),
        _feature("Search", [], "Should"),
        _feature("Referrals", [], "Could"),
        _feature("Profile", [], "Should"),
        _feature("Notify", [], "Could"),
        _feature("Export", [], "Should"),
    ])
    assert _committed_features(spec) == ["Login", "Search", "Profile", "Export"]


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            fn()
            print(f"ok  {name}")
    print("all guard checks passed")
