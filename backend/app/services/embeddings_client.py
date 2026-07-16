from __future__ import annotations

from functools import lru_cache

from openai import OpenAI

from app.core.config import settings

GROQ_BASE_URL = "https://api.groq.com/openai/v1"

_client: OpenAI | None = None


def _get_client() -> OpenAI | None:
    global _client
    if settings.GROQ_API_KEY is None:
        return None
    if _client is None:
        _client = OpenAI(api_key=settings.GROQ_API_KEY.get_secret_value(), base_url=GROQ_BASE_URL)
    return _client


def embeddings_enabled() -> bool:
    return _get_client() is not None and bool(settings.GROQ_EMBEDDING_MODEL)


@lru_cache(maxsize=512)
def _embed_cached(text: str) -> tuple[float, ...]:
    client = _get_client()
    if client is None or not settings.GROQ_EMBEDDING_MODEL:
        return ()
    response = client.embeddings.create(model=settings.GROQ_EMBEDDING_MODEL, input=text)
    return tuple(response.data[0].embedding)


def embed_text(text: str) -> list[float]:
    normalized = text.strip().lower()
    if not normalized:
        return []
    return list(_embed_cached(normalized))
