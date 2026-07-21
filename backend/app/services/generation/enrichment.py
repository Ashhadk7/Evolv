from __future__ import annotations

import asyncio
import re
from datetime import UTC, datetime
from typing import Any, Literal
from urllib.parse import urlparse

import httpx
from pydantic import BaseModel, ConfigDict, Field

from app.services.provider_clients import (
    TAVILY_SEARCH_PATH,
    tavily_api_key,
    tavily_headers,
    tavily_http_client,
    tavily_url,
)
from app.services.generation.text import clean

ResearchKind = Literal["market", "competitor"]
ResearchQuery = tuple[str, int]


class EnrichmentError(RuntimeError):
    """Raised when Tavily cannot return usable research signals."""


class ResearchSource(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    provider: Literal["tavily"]
    kind: Literal["web"]
    title: str = Field(min_length=1, max_length=180)
    url: str = Field(min_length=8, max_length=1000)
    snippet: str = Field(min_length=1, max_length=700)
    domain: str = Field(default="", max_length=120)
    published_at: str = Field(default="", alias="publishedAt", max_length=40)


class ResearchBundle(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    kind: ResearchKind
    generated_at: str = Field(alias="generatedAt")
    queries: list[str] = Field(default_factory=list)
    sources: list[ResearchSource] = Field(default_factory=list)
    provider_errors: list[str] = Field(default_factory=list, alias="providerErrors")
    notes: list[str] = Field(default_factory=list)
    credits_used: int = Field(default=0, alias="creditsUsed")

    def to_prompt_block(
        self, *, max_sources: int | None = None, snippet_chars: int | None = None
    ) -> str:
        # The full source list stays attached to the blueprint for the evidence
        # UI — these limits only trim what the LLM prompt carries.
        return sources_to_prompt_block(self.sources[:max_sources], snippet_chars=snippet_chars)

    def to_metadata(self) -> dict[str, Any]:
        return {
            "provider": "tavily",
            "kind": self.kind,
            "generatedAt": self.generated_at,
            "queries": self.queries,
            "creditsUsed": self.credits_used,
            "notes": self.notes,
            "providerErrors": self.provider_errors,
        }


async def enrich_market_context(
    idea: str, industry: str, *, queries: list[str] | None = None, max_sources: int = 10
) -> ResearchBundle:
    """Collect market signals. Uses planner queries when given, template queries otherwise."""

    idea = clean(idea)
    industry = clean(industry)
    if not idea or not industry:
        raise EnrichmentError("Market enrichment requires both idea and industry.")

    planned: list[ResearchQuery] = (
        [(query, 4) for query in queries]
        if queries
        else [
            (f"{industry} market size CAGR forecast startup 2025 2026", 4),
            (f"{idea} {industry} competitors market growth", 4),
            (f"{industry} startup adoption customer demand recent signals", 3),
        ]
    )
    return await _collect_research(
        "market", planned, idea=idea, industry=industry, max_sources=max_sources
    )


async def enrich_competitor_context(
    idea: str, industry: str, *, queries: list[str] | None = None, max_sources: int = 12
) -> ResearchBundle:
    """Collect competitor signals. Uses planner queries when given, template queries otherwise."""

    idea = clean(idea)
    industry = clean(industry)
    if not idea or not industry:
        raise EnrichmentError("Competitor enrichment requires both idea and industry.")

    planned: list[ResearchQuery] = (
        [(query, 4) for query in queries]
        if queries
        else [
            (f"{idea} competitors alternatives startup", 5),
            (f"{industry} startups competitors platform market map", 5),
            (f"{industry} startup competitors product launches recent signals", 3),
        ]
    )
    return await _collect_research(
        "competitor", planned, idea=idea, industry=industry, max_sources=max_sources
    )


async def _collect_research(
    kind: ResearchKind,
    queries: list[ResearchQuery],
    *,
    idea: str,
    industry: str,
    max_sources: int,
) -> ResearchBundle:
    try:
        tavily_key = tavily_api_key()
    except Exception:
        tavily_key = ""

    provider_errors: list[str] = []
    collected: list[ResearchSource] = []
    credits_used = 0

    if not tavily_key:
        provider_errors.append("tavily web: TAVILY_API_KEY is not set or empty.")
    else:
        try:
            async with tavily_http_client() as client:
                # Independent searches run together instead of one-at-a-time.
                results = await asyncio.gather(
                    *(_search_tavily(client, query, limit) for query, limit in queries),
                    return_exceptions=True,
                )
            
            for idx, res in enumerate(results):
                if isinstance(res, Exception):
                    provider_errors.append(f"tavily web: {res}")
                else:
                    sources, cost = res
                    collected.extend(sources)
                    credits_used += cost
        except Exception as exc:
            provider_errors.append(f"tavily web client: {exc}")

    sources = _filter_relevant(_dedupe_sources(collected), _relevance_tokens(idea, industry))[
        :max_sources
    ]
    notes: list[str] = []

    if not sources:
        # No real evidence means no blueprint — fabricated sources would flow
        # into the evidence UI and skew every downstream agent. Fail with the
        # actual provider error so the user can fix keys/limits.
        detail = "; ".join(provider_errors) or "no relevant results found"
        raise EnrichmentError(f"Web research unavailable ({detail})")

    if provider_errors:
        notes.append("Some Tavily searches failed; output uses the successful searches only.")

    return ResearchBundle(
        kind=kind,
        generatedAt=datetime.now(UTC).isoformat(),
        queries=[query for query, _ in queries],
        sources=sources,
        providerErrors=provider_errors,
        notes=notes,

        creditsUsed=credits_used,
    )


async def _search_tavily(
    client: httpx.AsyncClient,
    query: str,
    limit: int,
) -> tuple[list[ResearchSource], int]:
    response = await client.post(
        tavily_url(TAVILY_SEARCH_PATH),
        headers=tavily_headers(),
        json={
            "query": query,
            "search_depth": "advanced",
            "chunks_per_source": 3,
            "max_results": limit,
            "topic": "general",
            "include_answer": False,
            "include_raw_content": False,
            "include_images": False,
            "include_image_descriptions": False,
            "include_usage": True,
            "safe_search": False,
        },
    )
    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        detail = _tavily_error_detail(exc.response)
        raise EnrichmentError(
            f"Tavily returned HTTP {exc.response.status_code}: {detail}"
        ) from exc
    data = response.json()
    raw_results = data.get("results", [])
    usage = data.get("usage", {})
    credits_used = usage.get("credits", 0) if isinstance(usage, dict) else 0

    sources: list[ResearchSource] = []
    for item in raw_results[:limit]:
        if not isinstance(item, dict):
            continue
        source = _source_from_mapping(item)
        if source is not None:
            sources.append(source)
    return sources, int(credits_used or 0)


def _tavily_error_detail(response: httpx.Response) -> str:
    try:
        data = response.json()
    except ValueError:
        return response.text[:300] or response.reason_phrase

    if isinstance(data, dict):
        detail = data.get("detail") or data.get("error") or data.get("message") or data
        return str(detail)[:300]
    return str(data)[:300]


def _source_from_mapping(item: dict[str, Any]) -> ResearchSource | None:
    title = clean(_text(item.get("title")))
    url = clean(_text(item.get("url")))
    snippet = _clean_html(_text(item.get("content")))
    if not title or not url:
        return None
    if not snippet:
        snippet = title

    return ResearchSource(
        provider="tavily",
        kind="web",
        title=title[:180],
        url=url,
        snippet=snippet[:700],
        domain=_domain_for(url),
        publishedAt=_published_at_for(item),
    )


def sources_to_prompt_block(
    sources: list[ResearchSource], *, snippet_chars: int | None = None
) -> str:
    """Render sources for a prompt. `snippet_chars` trims snippets for
    second-hand consumers (persona/strategy/scorecard) to save prompt tokens —
    the primary analysts (market/competitor) get the full snippets."""
    if not sources:
        return "No external sources were collected."

    lines = []
    for index, source in enumerate(sources, start=1):
        published = f", published={source.published_at}" if source.published_at else ""
        domain = f", domain={source.domain}" if source.domain else ""
        snippet = source.snippet[:snippet_chars] if snippet_chars else source.snippet
        lines.append(
            f"[{index}] provider={source.provider}, kind={source.kind}{domain}{published}\n"
            f"Title: {source.title}\n"
            f"URL: {source.url}\n"
            f"Signal: {snippet}"
        )
    return "\n\n".join(lines)


_RELEVANCE_STOPWORDS = frozenset(
    "the a an and or for with that this from into your our their they will have has "
    "startup startups market business platform product service company".split()
)


def _relevance_tokens(idea: str, industry: str) -> set[str]:
    words = re.findall(r"[a-z]{4,}", f"{idea} {industry}".lower())
    return {word for word in words if word not in _RELEVANCE_STOPWORDS}


def _filter_relevant(
    sources: list[ResearchSource], tokens: set[str]
) -> list[ResearchSource]:
    # ponytail: naive token-overlap filter — swap for an LLM relevance check only
    # if off-topic sources still get through.
    if not tokens:
        return sources
    kept = [
        source
        for source in sources
        if tokens & set(re.findall(r"[a-z]{4,}", f"{source.title} {source.snippet}".lower()))
    ]
    return kept or sources  # never filter down to nothing


def _dedupe_sources(sources: list[ResearchSource]) -> list[ResearchSource]:
    seen: set[str] = set()
    unique: list[ResearchSource] = []
    for source in sources:
        key = source.url.lower().rstrip("/")
        if key in seen:
            continue
        seen.add(key)
        unique.append(source)
    return unique


def _published_at_for(item: dict[str, Any]) -> str:
    for key in ("published_date", "published", "date"):
        value = item.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()[:40]
    return ""


def _domain_for(url: str) -> str:
    parsed = urlparse(url)
    return parsed.netloc.removeprefix("www.")


def _text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return " ".join(_text(item) for item in value)
    return str(value)


def _clean_html(value: str) -> str:
    return clean(re.sub(r"<[^>]+>", " ", value))


def attach_research(analysis: BaseModel, research: ResearchBundle) -> dict[str, Any]:
    """Merge an agent's LLM analysis with its research sources + metadata."""
    return {
        **analysis.model_dump(by_alias=True),
        "sources": [source.model_dump(by_alias=True) for source in research.sources],
        "researchMetadata": research.to_metadata(),
    }
