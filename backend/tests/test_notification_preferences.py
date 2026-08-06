"""Guards for the notification preference whitelist.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_notification_preferences.py
(Also discoverable by pytest as test_* functions if it's ever installed.)

normalize_preferences rebuilds the dict from DEFAULT_NOTIFICATION_PREFERENCES, so
a key missing from that map is silently dropped on save while preference_enabled
still reports True — the toggle appears to work but the notification can never be
switched off. These checks keep the backend map and the frontend map in step.
"""
from __future__ import annotations

import re
from pathlib import Path

from app.services.notification_preferences import (
    DEFAULT_NOTIFICATION_PREFERENCES,
    normalize_preferences,
)

FRONTEND_API = (
    Path(__file__).resolve().parents[2]
    / "frontend"
    / "src"
    / "features"
    / "notifications"
    / "notifications-api.ts"
)

PROJECT_KEYS = ("projectInvite", "projectUpdate")


def _frontend_keys() -> set[str]:
    source = FRONTEND_API.read_text(encoding="utf-8")
    block = re.search(
        r"DEFAULT_NOTIFICATION_PREFERENCES:\s*NotificationPreferences\s*=\s*\{(.*?)\};",
        source,
        re.S,
    )
    assert block is not None, "could not find the frontend preference defaults"
    return set(re.findall(r"^\s*(\w+):", block.group(1), re.M))


def test_project_keys_exist_in_the_backend_map() -> None:
    for key in PROJECT_KEYS:
        assert key in DEFAULT_NOTIFICATION_PREFERENCES, f"{key} missing from the backend defaults"


def test_backend_and_frontend_defaults_have_identical_keys() -> None:
    backend = set(DEFAULT_NOTIFICATION_PREFERENCES)
    frontend = _frontend_keys()
    assert backend == frontend, (
        "preference keys drifted — "
        f"backend only: {sorted(backend - frontend)}, frontend only: {sorted(frontend - backend)}"
    )


def test_normalize_keeps_known_keys_and_drops_unknown_ones() -> None:
    normalized = normalize_preferences({"projectInvite": False, "notARealKey": True})
    assert normalized["projectInvite"] is False
    assert "notARealKey" not in normalized
    assert set(normalized) == set(DEFAULT_NOTIFICATION_PREFERENCES)


def test_normalize_tolerates_junk() -> None:
    assert normalize_preferences(None) == DEFAULT_NOTIFICATION_PREFERENCES
    assert normalize_preferences("nonsense") == DEFAULT_NOTIFICATION_PREFERENCES


def _run() -> None:
    for name, case in sorted(globals().items()):
        if name.startswith("test_") and callable(case):
            case()
            print(f"  ok  {name}")
    print("\nAll notification preference checks passed.")


if __name__ == "__main__":
    _run()
