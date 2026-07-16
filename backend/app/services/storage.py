from __future__ import annotations

from time import time
from uuid import UUID

import httpx

from app.core.config import settings

# Public bucket the user creates in the Supabase dashboard (Storage > New bucket,
# name "avatars", Public = on). Writes use the service-role key, so no RLS policy
# is needed. We use the stable Storage REST API directly (version-proof).
AVATAR_BUCKET = "avatars"
MAX_AVATAR_BYTES = 2 * 1024 * 1024
# content-type -> file extension for the images we accept
ALLOWED_AVATAR_TYPES: dict[str, str] = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
}


def _base_url() -> str:
    return settings.SUPABASE_URL.rstrip("/")


def _service_headers() -> dict[str, str]:
    key = settings.SUPABASE_SERVICE_ROLE_KEY.get_secret_value()
    return {"Authorization": f"Bearer {key}", "apikey": key}


def upload_avatar(user_id: UUID, data: bytes, content_type: str) -> str:
    """Upsert the avatar at avatars/{user_id}.{ext} and return its public URL."""
    ext = ALLOWED_AVATAR_TYPES[content_type]
    path = f"{user_id}.{ext}"
    response = httpx.post(
        f"{_base_url()}/storage/v1/object/{AVATAR_BUCKET}/{path}",
        headers={**_service_headers(), "Content-Type": content_type, "x-upsert": "true"},
        content=data,
        timeout=30,
    )
    response.raise_for_status()
    # The path is stable, so append a version so browsers/CDN fetch the new image.
    return f"{_base_url()}/storage/v1/object/public/{AVATAR_BUCKET}/{path}?v={int(time())}"


def delete_avatar(user_id: UUID) -> None:
    """Remove any stored avatar for the user (all accepted extensions)."""
    for ext in set(ALLOWED_AVATAR_TYPES.values()):
        httpx.delete(
            f"{_base_url()}/storage/v1/object/{AVATAR_BUCKET}/{user_id}.{ext}",
            headers=_service_headers(),
            timeout=30,
        )
