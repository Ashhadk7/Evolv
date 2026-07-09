from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

from pydantic import BaseModel


def build_profile_values(
    payload: BaseModel | Mapping[str, Any],
    fields: Iterable[str],
    *,
    defaults: Mapping[str, Any] | None = None,
    exclude: set[str] | None = None,
) -> dict[str, Any]:
    if isinstance(payload, BaseModel):
        data = payload.model_dump(exclude=exclude or set())
    else:
        data = payload

    return {
        field: _value_with_default(field, data.get(field), defaults)
        for field in fields
        if field in data
    }


def apply_profile_updates(
    profile: object,
    payload: BaseModel,
    fields: Iterable[str],
    *,
    defaults: Mapping[str, Any] | None = None,
    exclude: set[str] | None = None,
) -> None:
    updates = payload.model_dump(exclude_unset=True, exclude=exclude or set())
    for field, value in build_profile_values(updates, fields, defaults=defaults).items():
        setattr(profile, field, value)


def _value_with_default(field: str, value: Any, defaults: Mapping[str, Any] | None) -> Any:
    if defaults is not None and field in defaults and value in (None, ""):
        return defaults[field]
    return value
