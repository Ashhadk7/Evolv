from __future__ import annotations

import json
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.services.generation.enrichment import keep_cited_indexes

# Whether a claim traces to a provided research source or is the agent's own
# reasoning. Ungrounded agents (persona, strategy) must mark which is which so
# a confident invention is at least labelled instead of passing as fact.
EvidenceBasis = Literal["sourced", "assumption"]

SourceIndex = Annotated[int, Field(ge=1, le=10)]


class EvidenceClaim(BaseModel):
    """A short claim tagged with whether it is sourced or an assumption."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    text: str = Field(min_length=1, max_length=140)
    basis: EvidenceBasis
    source_indexes: list[SourceIndex] = Field(
        default_factory=list, alias="sourceIndexes", max_length=3
    )


def verify_grounding(claim: Any, shown_count: int) -> None:
    claim.source_indexes = keep_cited_indexes(claim.source_indexes, shown_count)
    if claim.basis == "sourced" and not claim.source_indexes:
        claim.basis = "assumption"


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
