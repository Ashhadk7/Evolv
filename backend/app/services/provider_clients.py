from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from functools import lru_cache
from typing import TYPE_CHECKING, Any

import httpx
from pydantic import SecretStr

from app.core.config import get_settings

if TYPE_CHECKING:
    from openai import OpenAI
    from pinecone import Pinecone

GROQ_CHAT_COMPLETIONS_PATH = "/chat/completions"
TAVILY_SEARCH_PATH = "/search"
BLUEPRINT_RESEARCH_USER_AGENT = "Evolv/0.1 blueprint-research"
DEVELOPER_EMBEDDING_NAMESPACE = "developers"


def _secret_value(secret: SecretStr) -> str:
    return secret.get_secret_value().strip()


def provider_url(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}/{path.lstrip('/')}"


def bearer_headers(api_key: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}


def groq_api_key() -> str:
    return _secret_value(get_settings().GROQ_API_KEY)


def groq_url(path: str) -> str:
    return provider_url(get_settings().GROQ_API_BASE_URL, path)


def groq_headers() -> dict[str, str]:
    return bearer_headers(groq_api_key())


@asynccontextmanager
async def groq_http_client() -> AsyncIterator[httpx.AsyncClient]:
    settings = get_settings()
    async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
        yield client


@lru_cache(maxsize=1)
def groq_openai_client() -> OpenAI:
    from openai import OpenAI

    settings = get_settings()
    return OpenAI(
        api_key=groq_api_key(),
        base_url=settings.GROQ_API_BASE_URL.rstrip("/"),
    )


def tavily_api_key() -> str:
    return _secret_value(get_settings().TAVILY_API_KEY)


def tavily_url(path: str) -> str:
    return provider_url(get_settings().TAVILY_BASE_URL, path)


def tavily_headers() -> dict[str, str]:
    return bearer_headers(tavily_api_key())


@asynccontextmanager
async def tavily_http_client() -> AsyncIterator[httpx.AsyncClient]:
    settings = get_settings()
    async with httpx.AsyncClient(
        timeout=settings.ENRICHMENT_TIMEOUT_SECONDS,
        headers={"User-Agent": BLUEPRINT_RESEARCH_USER_AGENT},
    ) as client:
        yield client


@lru_cache(maxsize=1)
def pinecone_client() -> Pinecone | None:
    try:
        from pinecone import Pinecone
    except ImportError:
        return None

    settings = get_settings()
    if settings.PINECONE_API_KEY is None:
        return None
    return Pinecone(api_key=_secret_value(settings.PINECONE_API_KEY))


@lru_cache(maxsize=1)
def pinecone_index() -> Any | None:
    settings = get_settings()
    client = pinecone_client()
    if client is None or not settings.PINECONE_INDEX_NAME:
        return None
    return client.Index(name=settings.PINECONE_INDEX_NAME)
