"""Self-checks for the milestones-blob backfill helpers in migration 20260805_0001.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_project_backfill.py
(Also discoverable by pytest as test_* functions if it's ever installed.)

The migration inlines these helpers so it stays frozen against model drift, so
this loads it by path rather than importing a package.
"""
from __future__ import annotations

import importlib.util
from datetime import date
from pathlib import Path
from uuid import UUID

_MIGRATION = (
    Path(__file__).resolve().parents[1]
    / "alembic"
    / "versions"
    / "20260805_0001_project_workspace_tables.py"
)
_spec = importlib.util.spec_from_file_location("project_workspace_tables", _MIGRATION)
assert _spec is not None and _spec.loader is not None
migration = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(migration)


def test_project_state_requires_phase_states() -> None:
    assert migration._project_state(None) is None
    assert migration._project_state([]) is None
    assert migration._project_state([{"key": "other", "value": {}}]) is None
    assert migration._project_state([{"key": "projectState", "value": {}}]) is None
    assert (
        migration._project_state([{"key": "projectState", "value": {"phaseStates": "nope"}}])
        is None
    )

    state = {"phaseStates": []}
    assert migration._project_state([{"key": "projectState", "value": state}]) == state


def test_cents_rounds_and_floors_at_zero() -> None:
    assert migration._cents(0) == 0
    assert migration._cents(1200) == 120_000
    assert migration._cents(2399.995) == 240_000
    assert migration._cents(0.1 + 0.2) == 30
    assert migration._cents(-5) == 0
    assert migration._cents(None) == 0
    assert migration._cents("junk") == 0


def test_iso_date_tolerates_timestamps_and_junk() -> None:
    assert migration._iso_date("2026-08-05") == date(2026, 8, 5)
    assert migration._iso_date("2026-08-05T09:00:00Z") == date(2026, 8, 5)
    assert migration._iso_date("not-a-date") is None
    assert migration._iso_date(None) is None


def test_lower_normalizes_frontend_labels() -> None:
    assert migration._lower("In Progress", migration.ISSUE_STATUSES, "open") == "in_progress"
    assert migration._lower("Resolved", migration.ISSUE_STATUSES, "open") == "resolved"
    assert migration._lower("High", migration.ISSUE_PRIORITIES, "medium") == "high"
    assert migration._lower("Bogus", migration.ISSUE_PRIORITIES, "medium") == "medium"
    assert migration._lower(None, migration.DEADLINE_STATUSES, "pending") == "pending"


def test_uuid_key_matches_db_uuids_against_json_strings() -> None:
    raw = "3f2504e0-4f89-11d3-9a0c-0305e82c3301"
    assert migration._uuid_key(UUID(raw)) == migration._uuid_key(raw)
    assert migration._uuid_key(raw.upper()) == migration._uuid_key(raw)
    assert migration._uuid_key(None) is None
    assert migration._uuid_key("not-a-uuid") is None

    known = {migration._uuid_key(UUID(raw))}
    assert migration._uuid_key(raw) in known


def test_deliverables_reads_current_and_legacy_shapes() -> None:
    current = migration._deliverables(
        {"deliverables": [{"text": "Ship API", "done": True}, {"text": "  ", "done": False}]}
    )
    assert current == [{"text": "Ship API", "done": True}]

    legacy = migration._deliverables({"deliverablesDone": [True, False]})
    assert legacy == [
        {"text": "Deliverable 1", "done": True},
        {"text": "Deliverable 2", "done": False},
    ]

    assert migration._deliverables({}) == []


def test_amount_paid_falls_back_to_legacy_payment_status() -> None:
    assert migration._amount_paid({"amountPaid": 500}) == 50_000
    assert migration._amount_paid({"paymentStatus": "Released", "amountAgreed": 1200}) == 120_000
    assert migration._amount_paid({"paymentStatus": "Pending", "amountAgreed": 1200}) == 0
    assert migration._amount_paid({}) == 0


def test_payments_prefers_ledger_then_synthesizes_from_legacy() -> None:
    ledger = migration._payments(
        {"payments": [{"amount": 600, "date": "2026-08-01"}, {"amount": 0, "date": "2026-08-02"}]}
    )
    assert ledger == [{"amount_cents": 60_000, "date": date(2026, 8, 1)}]

    synthesized = migration._payments(
        {"paymentStatus": "Released", "amountAgreed": 1200, "hiredAt": "2026-07-01"}
    )
    assert synthesized == [{"amount_cents": 120_000, "date": date(2026, 7, 1)}]

    assert migration._payments({"amountPaid": 0}) == []


def _run() -> None:
    for name, case in sorted(globals().items()):
        if name.startswith("test_") and callable(case):
            case()
            print(f"  ok  {name}")
    print("\nAll project backfill self-checks passed.")


if __name__ == "__main__":
    _run()
