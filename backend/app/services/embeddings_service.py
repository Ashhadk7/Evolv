from __future__ import annotations

from functools import lru_cache

from app.core.config import get_settings
from app.services.provider_clients import groq_openai_client


def embeddings_enabled() -> bool:
    settings = get_settings()
    has_key = bool(settings.GROQ_API_KEY.get_secret_value().strip())
    return has_key and bool(settings.GROQ_EMBEDDING_MODEL)


@lru_cache(maxsize=512)
def _embed_cached(text: str) -> tuple[float, ...]:
    settings = get_settings()
    if not settings.GROQ_EMBEDDING_MODEL:
        return ()
    client = groq_openai_client()
    response = client.embeddings.create(model=settings.GROQ_EMBEDDING_MODEL, input=text)
    return tuple(response.data[0].embedding)


def embed_text(text: str) -> list[float]:
    normalized = text.strip().lower()
    if not normalized:
        return []
    return list(_embed_cached(normalized))
