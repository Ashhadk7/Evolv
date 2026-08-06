"""One-off: populate Pinecone with embeddings for developers and public blueprints."""

from app.db.session import SessionLocal
from app.services.matching_service import (
    reindex_blueprint_embeddings,
    reindex_developer_embeddings,
)

db = SessionLocal()
try:
    developers = reindex_developer_embeddings(db)
    blueprints = reindex_blueprint_embeddings(db)
    print(f"Indexed {developers} developers and {blueprints} public blueprints into Pinecone.")
finally:
    db.close()
