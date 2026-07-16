from app.services.provider_clients import DEVELOPER_EMBEDDING_NAMESPACE, pinecone_index

DEVELOPER_NAMESPACE = DEVELOPER_EMBEDDING_NAMESPACE


def _get_index():
    return pinecone_index()


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
