"""One-off: populate Pinecone with embeddings for all available developers."""

from app.db.session import SessionLocal
from app.services.matching_service import reindex_developer_embeddings

db = SessionLocal()
try:
    count = reindex_developer_embeddings(db)
    print(f"Indexed {count} developers into Pinecone.")
finally:
    db.close()
