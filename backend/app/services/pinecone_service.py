from __future__ import annotations

from pinecone import Pinecone

from app.core.config import settings

DEVELOPER_NAMESPACE = "developers"

_client: Pinecone | None = None


def _get_client() -> Pinecone | None:
    global _client
    if settings.PINECONE_API_KEY is None:
        return None
    if _client is None:
        _client = Pinecone(api_key=settings.PINECONE_API_KEY.get_secret_value())
    return _client


def _get_index():
    client = _get_client()
    if client is None or not settings.PINECONE_INDEX_NAME:
        return None
    return client.Index(name=settings.PINECONE_INDEX_NAME)


def index_ready() -> bool:
    return _get_index() is not None


def upsert_developer(developer_id: str, embedding: list[float]) -> None:
    index = _get_index()
    if index is None or not embedding:
        return
    index.upsert(vectors=[(developer_id, embedding)], namespace=DEVELOPER_NAMESPACE)


def delete_developer(developer_id: str) -> None:
    index = _get_index()
    if index is None:
        return
    index.delete(ids=[developer_id], namespace=DEVELOPER_NAMESPACE)


def query_top_k(embedding: list[float], top_k: int) -> list[tuple[str, float]]:
    index = _get_index()
    if index is None or not embedding:
        return []

    result = index.query(vector=embedding, top_k=top_k, namespace=DEVELOPER_NAMESPACE)
    return [(str(match.id), float(match.score)) for match in result.matches]
