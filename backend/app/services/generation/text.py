from __future__ import annotations

import re
from collections.abc import Callable

_WHITESPACE = re.compile(r"\s+")
_TIMELINE = re.compile(r"(\d+(?:\.\d+)?)\s*(week|month|year)", re.IGNORECASE)
_TO_WEEKS = {"week": 1.0, "month": 4.33, "year": 52.0}


def clean(value: str) -> str:
    """Collapse whitespace and trim. None-safe (empty string for falsy input)."""
    return _WHITESPACE.sub(" ", value or "").strip()


def weeks_from_timeline(value: str) -> int:
    """Founder's free-text timeline -> a whole-week build budget (0 = unparseable).

    The product agent invents phase weeks, and the frontend's entire cost model
    is `Σ phase.weeks × contractor rate` — so an unanchored roadmap silently
    halves the quoted build cost. Turning "4 months" into a concrete number the
    prompt can target is the code-computes half of "LLM judges, code computes".

    Takes the largest match so a range ("3-6 months") budgets the outer bound
    rather than the founder's most optimistic reading.
    """
    matches = _TIMELINE.findall(value or "")
    return round(max((float(n) * _TO_WEEKS[u.lower()] for n, u in matches), default=0.0))


def clip(limit: int) -> Callable[[object], object]:
    """BeforeValidator for free-form LLM text: truncate instead of hard-failing.

    Cuts at the last sentence boundary past the halfway mark when one exists,
    so an overlong paragraph loses its tail rather than failing the pipeline.
    """

    def _clip(value: object) -> object:
        if isinstance(value, str) and len(value) > limit:
            cut = value[:limit]
            period = cut.rfind(". ")
            return cut[: period + 1] if period > limit // 2 else cut
        return value

    return _clip
