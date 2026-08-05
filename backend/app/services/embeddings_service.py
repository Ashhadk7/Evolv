from __future__ import annotations

import logging
from functools import lru_cache

from app.core.config import get_settings
from app.services.provider_clients import pinecone_client

logger = logging.getLogger(__name__)

QUERY_INPUT_TYPE = "query"
PASSAGE_INPUT_TYPE = "passage"


def embeddings_enabled() -> bool:
    settings = get_settings()
    return bool(settings.PINECONE_API_KEY and settings.PINECONE_EMBEDDING_MODEL)


@lru_cache(maxsize=512)
def _embed_cached(text: str, input_type: str) -> tuple[float, ...]:
    client = pinecone_client()
    if client is None:
        return ()

    settings = get_settings()
    response = client.inference.embed(
        model=settings.PINECONE_EMBEDDING_MODEL,
        inputs=[text],
        parameters={"input_type": input_type, "truncate": "END"},
    )
    return tuple(response.data[0].values)


def embed_text(text: str, *, input_type: str = QUERY_INPUT_TYPE) -> list[float]:
    """Embed a single string, or return [] when embeddings are unavailable.

    Callers treat an empty vector as "no semantic signal" and fall back to
    rule-based scoring, so a provider outage degrades ranking quality instead
    of failing the request.
    """
    normalized = text.strip().lower()
    if not normalized or not embeddings_enabled():
        return []
    try:
        return list(_embed_cached(normalized, input_type))
    except Exception:
        logger.exception("Embedding call failed for input_type=%s", input_type)
        return []
