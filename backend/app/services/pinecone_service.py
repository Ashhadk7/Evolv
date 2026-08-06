from app.services.provider_clients import (
    BLUEPRINT_EMBEDDING_NAMESPACE,
    DEVELOPER_EMBEDDING_NAMESPACE,
    pinecone_index,
)

DEVELOPER_NAMESPACE = DEVELOPER_EMBEDDING_NAMESPACE
BLUEPRINT_NAMESPACE = BLUEPRINT_EMBEDDING_NAMESPACE


def _get_index():
    return pinecone_index()


def index_ready() -> bool:
    return _get_index() is not None


def upsert_developer(developer_id: str, embedding: list[float]) -> None:
    _upsert(DEVELOPER_NAMESPACE, developer_id, embedding)


def delete_developer(developer_id: str) -> None:
    _delete(DEVELOPER_NAMESPACE, developer_id)


def query_top_k(embedding: list[float], top_k: int) -> list[tuple[str, float]]:
    return _query(DEVELOPER_NAMESPACE, embedding, top_k)


def upsert_blueprint(blueprint_id: str, embedding: list[float]) -> None:
    _upsert(BLUEPRINT_NAMESPACE, blueprint_id, embedding)


def delete_blueprint(blueprint_id: str) -> None:
    _delete(BLUEPRINT_NAMESPACE, blueprint_id)


def query_blueprints(embedding: list[float], top_k: int) -> dict[str, float]:
    """Blueprint ids scored against one developer vector, keyed for direct lookup.

    Discover scores every public blueprint it is already listing, so the caller
    needs a similarity per id rather than a ranked slice.
    """
    return dict(_query(BLUEPRINT_NAMESPACE, embedding, top_k))


def _upsert(namespace: str, vector_id: str, embedding: list[float]) -> None:
    index = _get_index()
    if index is None or not embedding:
        return
    index.upsert(vectors=[(vector_id, embedding)], namespace=namespace)


def _delete(namespace: str, vector_id: str) -> None:
    index = _get_index()
    if index is None:
        return
    index.delete(ids=[vector_id], namespace=namespace)


def _query(namespace: str, embedding: list[float], top_k: int) -> list[tuple[str, float]]:
    index = _get_index()
    if index is None or not embedding or top_k < 1:
        return []

    result = index.query(vector=embedding, top_k=top_k, namespace=namespace)
    return [(str(match.id), float(match.score)) for match in result.matches]
