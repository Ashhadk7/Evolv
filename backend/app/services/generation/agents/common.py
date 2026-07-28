from __future__ import annotations

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
