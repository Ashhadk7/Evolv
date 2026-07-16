from __future__ import annotations

import re

_WHITESPACE = re.compile(r"\s+")


def clean(value: str) -> str:
    """Collapse whitespace and trim. None-safe (empty string for falsy input)."""
    return _WHITESPACE.sub(" ", value or "").strip()
