from __future__ import annotations

from time import time
from uuid import UUID, uuid4

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

# Certificate proof images share the public bucket under their own prefix, so no
# second bucket has to be provisioned per environment. Certifications are shown
# on public developer profiles, so public read matches how they are consumed.
CERTIFICATE_PREFIX = "certificates"
MAX_CERTIFICATE_BYTES = 5 * 1024 * 1024

# Issue attachments are private: bug reports routinely carry staging URLs, tokens
# and customer data, so they are never served from a guessable public path. Reads
# go through short-lived signed URLs minted after the caller passes the project
# membership check.
ATTACHMENT_BUCKET = "project-attachments"
MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
ATTACHMENT_URL_TTL_SECONDS = 300
ALLOWED_ATTACHMENT_TYPES: dict[str, str] = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "application/pdf": "pdf",
}

_ensured_buckets: set[str] = set()


def _ensure_bucket(name: str, *, public: bool) -> None:
    """Create the bucket on first use so no environment needs a manual setup step."""
    if name in _ensured_buckets:
        return
    response = httpx.post(
        f"{_base_url()}/storage/v1/bucket",
        headers={**_service_headers(), "Content-Type": "application/json"},
        json={"name": name, "id": name, "public": public},
        timeout=30,
    )
    if response.status_code not in (200, 201, 409):
        response.raise_for_status()
    _ensured_buckets.add(name)


def upload_attachment(
    issue_id: UUID, data: bytes, content_type: str, *, suffix: str | None = None
) -> str:
    """Store a private attachment and return its storage path."""
    _ensure_bucket(ATTACHMENT_BUCKET, public=False)
    ext = ALLOWED_ATTACHMENT_TYPES[content_type]
    path = f"{issue_id}/{suffix or uuid4()}.{ext}"
    response = httpx.post(
        f"{_base_url()}/storage/v1/object/{ATTACHMENT_BUCKET}/{path}",
        headers={**_service_headers(), "Content-Type": content_type, "x-upsert": "true"},
        content=data,
        timeout=60,
    )
    response.raise_for_status()
    return path


def signed_attachment_url(path: str, ttl_seconds: int = ATTACHMENT_URL_TTL_SECONDS) -> str:
    response = httpx.post(
        f"{_base_url()}/storage/v1/object/sign/{ATTACHMENT_BUCKET}/{path}",
        headers={**_service_headers(), "Content-Type": "application/json"},
        json={"expiresIn": ttl_seconds},
        timeout=30,
    )
    response.raise_for_status()
    signed = response.json()["signedURL"]
    return f"{_base_url()}/storage/v1{signed}"


def delete_attachment(path: str) -> None:
    httpx.delete(
        f"{_base_url()}/storage/v1/object/{ATTACHMENT_BUCKET}/{path}",
        headers=_service_headers(),
        timeout=30,
    )


def _base_url() -> str:
    return settings.SUPABASE_URL.rstrip("/")


def _service_headers() -> dict[str, str]:
    key = settings.SUPABASE_SERVICE_ROLE_KEY.get_secret_value()
    return {"Authorization": f"Bearer {key}", "apikey": key}


def _upload(path: str, data: bytes, content_type: str) -> str:
    """Upsert an object into the public bucket and return its public URL."""
    response = httpx.post(
        f"{_base_url()}/storage/v1/object/{AVATAR_BUCKET}/{path}",
        headers={**_service_headers(), "Content-Type": content_type, "x-upsert": "true"},
        content=data,
        timeout=30,
    )
    response.raise_for_status()
    return f"{_base_url()}/storage/v1/object/public/{AVATAR_BUCKET}/{path}"


def upload_avatar(user_id: UUID, data: bytes, content_type: str) -> str:
    """Upsert the avatar at avatars/{user_id}.{ext} and return its public URL."""
    ext = ALLOWED_AVATAR_TYPES[content_type]
    url = _upload(f"{user_id}.{ext}", data, content_type)
    # The path is stable, so append a version so browsers/CDN fetch the new image.
    return f"{url}?v={int(time())}"


def upload_certificate_image(user_id: UUID, data: bytes, content_type: str) -> str:
    """Store a certificate proof image under a unique path and return its URL.

    Each upload gets a fresh name so replacing an image never has to invalidate a
    cached URL, and so an upload does not depend on the certification row having
    been persisted yet.
    """
    ext = ALLOWED_AVATAR_TYPES[content_type]
    return _upload(f"{CERTIFICATE_PREFIX}/{user_id}/{uuid4()}.{ext}", data, content_type)


def delete_avatar(user_id: UUID) -> None:
    """Remove any stored avatar for the user (all accepted extensions)."""
    for ext in set(ALLOWED_AVATAR_TYPES.values()):
        httpx.delete(
            f"{_base_url()}/storage/v1/object/{AVATAR_BUCKET}/{user_id}.{ext}",
            headers=_service_headers(),
            timeout=30,
        )
