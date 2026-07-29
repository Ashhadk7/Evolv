from __future__ import annotations

import json
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# Whether a claim traces to a provided research source or is the agent's own
# reasoning. Ungrounded agents (persona, strategy) must mark which is which so
# a confident invention is at least labelled instead of passing as fact.
EvidenceBasis = Literal["sourced", "assumption"]


class EvidenceClaim(BaseModel):
    """A short claim tagged with whether it is sourced or an assumption."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    text: str = Field(min_length=1, max_length=140)
    basis: EvidenceBasis


def agent_json(payload: BaseModel) -> str:
    """One agent's output as prompt input for a downstream agent.

    Sources and research metadata are excluded: the orchestrator passes the
    research block separately, and duplicating it here would double the prompt
    for no extra signal.
    """
    return json.dumps(
        payload.model_dump(by_alias=True, exclude={"sources", "research_metadata"}),
        ensure_ascii=True,
    )
