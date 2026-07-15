from __future__ import annotations

import re
from collections.abc import Awaitable
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Literal
from urllib.parse import urlparse

import httpx
from pydantic import BaseModel, ConfigDict, Field

from app.core.config import get_settings

ResearchKind = Literal["market", "competitor"]
SourceKind = Literal["web"]
SourceProvider = Literal["tavily"]
TavilyTopic = Literal["general"]


class EnrichmentError(RuntimeError):
    """Raised when Tavily cannot return usable research signals."""


@dataclass(frozen=True)
class TavilyQuery:
    query: str
    topic: TavilyTopic
    kind: SourceKind
    limit: int


class ResearchSource(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    provider: SourceProvider
    kind: SourceKind
    title: str = Field(min_length=1, max_length=180)
    url: str = Field(min_length=8, max_length=1000)
    snippet: str = Field(min_length=1, max_length=700)
    domain: str | None = Field(default=None, max_length=120)
    published_at: str | None = Field(default=None, alias="publishedAt", max_length=40)


class ResearchBundle(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    kind: ResearchKind
    generated_at: str = Field(alias="generatedAt")
    queries: list[str] = Field(default_factory=list)
    sources: list[ResearchSource] = Field(default_factory=list)
    provider_errors: list[str] = Field(default_factory=list, alias="providerErrors")
    notes: list[str] = Field(default_factory=list)
    credits_used: int | None = Field(default=None, alias="creditsUsed")

    def to_prompt_block(self) -> str:
        if not self.sources:
            return "No external sources were collected."

        lines = []
        for index, source in enumerate(self.sources, start=1):
            published = f", published={source.published_at}" if source.published_at else ""
            domain = f", domain={source.domain}" if source.domain else ""
            lines.append(
                f"[{index}] provider={source.provider}, kind={source.kind}{domain}{published}\n"
                f"Title: {source.title}\n"
                f"URL: {source.url}\n"
                f"Signal: {source.snippet}"
            )
        return "\n\n".join(lines)

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


async def enrich_market_context(idea: str, industry: str, *, max_sources: int = 10) -> ResearchBundle:
    """Collect market-size, growth, competitor, and timing signals using Tavily only."""

    idea = _clean(idea)
    industry = _clean(industry)
    if not idea or not industry:
        raise EnrichmentError("Market enrichment requires both idea and industry.")

    queries = [
        TavilyQuery(
            query=f"{industry} market size CAGR forecast startup 2025 2026",
            topic="general",
            kind="web",
            limit=4,
        ),
        TavilyQuery(
            query=f"{idea} {industry} competitors market growth",
            topic="general",
            kind="web",
            limit=4,
        ),
        TavilyQuery(
            query=f"{industry} startup funding adoption customer demand recent signals",
            topic="general",
            kind="web",
            limit=3,
        ),
    ]
    return await _collect_research("market", queries, max_sources=max_sources)


async def enrich_competitor_context(
    idea: str, industry: str, *, max_sources: int = 12
) -> ResearchBundle:
    """Collect competitor and category signals using Tavily only."""

    idea = _clean(idea)
    industry = _clean(industry)
    if not idea or not industry:
        raise EnrichmentError("Competitor enrichment requires both idea and industry.")

    queries = [
        TavilyQuery(
            query=f"{idea} competitors alternatives startup",
            topic="general",
            kind="web",
            limit=5,
        ),
        TavilyQuery(
            query=f"{industry} startups competitors platform market map",
            topic="general",
            kind="web",
            limit=5,
        ),
        TavilyQuery(
            query=f"{industry} startup competitors funding launches recent signals",
            topic="general",
            kind="web",
            limit=3,
        ),
    ]
    return await _collect_research("competitor", queries, max_sources=max_sources)


async def _collect_research(
    kind: ResearchKind,
    queries: list[TavilyQuery],
    *,
    max_sources: int,
) -> ResearchBundle:
    settings = get_settings()
    tavily_key = _secret_value(settings.TAVILY_API_KEY)
    if not tavily_key:
        raise EnrichmentError("TAVILY_API_KEY is required for blueprint enrichment.")

    provider_errors: list[str] = []
    collected: list[ResearchSource] = []
    credits_used = 0

    async with httpx.AsyncClient(
        timeout=settings.ENRICHMENT_TIMEOUT_SECONDS,
        headers={"User-Agent": "Evolv/0.1 blueprint-research"},
    ) as client:
        results = []
        for query in queries:
            result = await _safe_provider_call(
                f"tavily {query.kind}",
                _search_tavily(client, query, tavily_key),
            )
            results.append(result)

    for provider_name, result in results:
        if isinstance(result, Exception):
            provider_errors.append(f"{provider_name}: {result}")
            continue
        sources, usage = result
        collected.extend(sources)
        credits_used += usage

    sources = _dedupe_sources(collected)[:max_sources]
    if not sources:
        details = "; ".join(provider_errors) if provider_errors else "Tavily returned no results."
        raise EnrichmentError(f"No Tavily research sources were found. {details}")

    notes = [
        "Tavily-only enrichment: web results are collected before Groq synthesis."
    ]
    if provider_errors:
        notes.append("Some Tavily searches failed; output uses the successful searches only.")

    return ResearchBundle(
        kind=kind,
        generatedAt=datetime.now(UTC).isoformat(),
        queries=[query.query for query in queries],
        sources=sources,
        providerErrors=provider_errors,
        notes=notes,
        creditsUsed=credits_used or None,
    )


async def _safe_provider_call(
    provider_name: str,
    call: Awaitable[tuple[list[ResearchSource], int]],
) -> tuple[str, tuple[list[ResearchSource], int] | Exception]:
    try:
        return provider_name, await call
    except Exception as exc:  # noqa: BLE001 - preserve provider-specific failure text.
        return provider_name, exc


async def _search_tavily(
    client: httpx.AsyncClient,
    query: TavilyQuery,
    api_key: str,
) -> tuple[list[ResearchSource], int]:
    settings = get_settings()
    response = await client.post(
        f"{settings.TAVILY_BASE_URL.rstrip('/')}/search",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "query": query.query,
            "search_depth": "basic",
            "chunks_per_source": 3,
            "max_results": query.limit,
            "topic": query.topic,
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
    for item in raw_results[: query.limit]:
        if not isinstance(item, dict):
            continue
        source = _source_from_mapping(query.kind, item)
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


def _source_from_mapping(kind: SourceKind, item: dict[str, Any]) -> ResearchSource | None:
    title = _clean(_text(item.get("title")))
    url = _clean(_text(item.get("url")))
    snippet = _clean_html(_text(item.get("content")))
    if not title or not url:
        return None
    if not snippet:
        snippet = title

    return ResearchSource(
        provider="tavily",
        kind=kind,
        title=title[:180],
        url=url,
        snippet=snippet[:700],
        domain=_domain_for(url),
        publishedAt=_published_at_for(item),
    )


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


def _published_at_for(item: dict[str, Any]) -> str | None:
    for key in ("published_date", "published", "date"):
        value = item.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()[:40]
    return None


def _secret_value(value: Any) -> str:
    if value is None:
        return ""
    if hasattr(value, "get_secret_value"):
        return value.get_secret_value().strip()
    return str(value).strip()


def _domain_for(url: str) -> str | None:
    parsed = urlparse(url)
    return parsed.netloc.removeprefix("www.") or None


def _text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return " ".join(_text(item) for item in value)
    return str(value)


def _clean_html(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    return _clean(value)


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()
