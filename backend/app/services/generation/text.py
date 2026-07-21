from __future__ import annotations

import re
from collections.abc import Callable

_WHITESPACE = re.compile(r"\s+")


def clean(value: str) -> str:
    """Collapse whitespace and trim. None-safe (empty string for falsy input)."""
    return _WHITESPACE.sub(" ", value or "").strip()


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
