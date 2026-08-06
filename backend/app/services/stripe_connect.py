from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import DeveloperProfile, User
from app.repositories import developer_profiles as developer_profiles_repository
from app.schemas.stripe_connect import (
    StripeConnectAccountLinkRequest,
    StripeConnectAccountLinkResponse,
    StripeConnectStatusResponse,
)
from app.services.profile_helpers import commit_profile_change

STRIPE_TIMEOUT_SECONDS = 20


def create_developer_account_link(
    db: Session,
    *,
    current_user: User,
    payload: StripeConnectAccountLinkRequest,
) -> StripeConnectAccountLinkResponse:
    profile = _get_or_create_developer_profile(db, current_user)
    account = _get_or_create_connected_account(profile, current_user)
    _sync_profile_from_account(profile, account)
    commit_profile_change(db, "Stripe account details could not be saved.")

    account_link = _stripe_post(
        "/account_links",
        {
            "account": profile.stripe_account_id,
            "refresh_url": str(payload.refresh_url),
            "return_url": str(payload.return_url),
            "type": "account_onboarding",
        },
    )

    status_payload = _status_from_account(account)
    return StripeConnectAccountLinkResponse(
        **status_payload.model_dump(),
        url=str(account_link["url"]),
    )


def get_developer_connect_status(
    db: Session,
    *,
    current_user: User,
) -> StripeConnectStatusResponse:
    profile = developer_profiles_repository.get_developer_profile_by_user_id(
        db,
        current_user.id,
    )
    if profile is None:
        return StripeConnectStatusResponse()

    if not profile.stripe_account_id or not _has_stripe_secret():
        return _status_from_profile(profile)

    account = _stripe_get(f"/accounts/{profile.stripe_account_id}")
    _sync_profile_from_account(profile, account)
    commit_profile_change(db, "Stripe account status could not be saved.")
    return _status_from_account(account)


def _get_or_create_developer_profile(db: Session, current_user: User) -> DeveloperProfile:
    profile = developer_profiles_repository.get_developer_profile_by_user_id(db, current_user.id)
    if profile is not None:
        return profile

    profile = DeveloperProfile(
        user_id=current_user.id,
        availability=True,
        open_to_remote=False,
        skills=[],
        tags=[],
        skill_entries=[],
        rating_avg=0,
        profile_complete=False,
    )
    db.add(profile)
    db.flush()
    return profile


def _get_or_create_connected_account(profile: DeveloperProfile, current_user: User) -> dict[str, Any]:
    if profile.stripe_account_id:
        return _stripe_get(f"/accounts/{profile.stripe_account_id}")

    data = {
        "type": "express",
        "email": current_user.email,
        "capabilities[transfers][requested]": "true",
        "metadata[evolv_user_id]": str(current_user.id),
        "metadata[evolv_role]": "developer",
    }
    country_code = (current_user.country_code or "").strip().upper()
    if len(country_code) == 2:
        data["country"] = country_code

    account = _stripe_post("/accounts", data)
    profile.stripe_account_id = str(account["id"])
    return account


def _sync_profile_from_account(profile: DeveloperProfile, account: dict[str, Any]) -> None:
    profile.stripe_account_id = str(account["id"])
    profile.stripe_onboarding_complete = bool(account.get("details_submitted"))
    profile.stripe_charges_enabled = bool(account.get("charges_enabled"))
    profile.stripe_payouts_enabled = bool(account.get("payouts_enabled"))


def _status_from_profile(profile: DeveloperProfile) -> StripeConnectStatusResponse:
    return StripeConnectStatusResponse(
        account_id=profile.stripe_account_id,
        onboarding_complete=profile.stripe_onboarding_complete,
        charges_enabled=profile.stripe_charges_enabled,
        payouts_enabled=profile.stripe_payouts_enabled,
    )


def _status_from_account(account: dict[str, Any]) -> StripeConnectStatusResponse:
    requirements = account.get("requirements") or {}
    currently_due = requirements.get("currently_due") or []
    if not isinstance(currently_due, list):
        currently_due = []

    return StripeConnectStatusResponse(
        account_id=str(account["id"]),
        onboarding_complete=bool(account.get("details_submitted")),
        charges_enabled=bool(account.get("charges_enabled")),
        payouts_enabled=bool(account.get("payouts_enabled")),
        currently_due=[str(item) for item in currently_due],
        disabled_reason=requirements.get("disabled_reason"),
    )


def _stripe_get(path: str) -> dict[str, Any]:
    return _stripe_request("GET", path)


def _stripe_post(
    path: str,
    data: dict[str, str | None],
    *,
    idempotency_key: str | None = None,
) -> dict[str, Any]:
    return _stripe_request("POST", path, data=data, idempotency_key=idempotency_key)


def _stripe_request(
    method: str,
    path: str,
    *,
    data: dict[str, str | None] | None = None,
    idempotency_key: str | None = None,
) -> dict[str, Any]:
    secret_key = _stripe_secret()
    url = f"{settings.STRIPE_API_BASE_URL.rstrip('/')}{path}"
    headers = {"Authorization": f"Bearer {secret_key}"}
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key

    try:
        with httpx.Client(timeout=STRIPE_TIMEOUT_SECONDS) as client:
            response = client.request(method, url, data=data, headers=headers)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not reachable right now. Please try again shortly.",
        ) from exc

    if response.status_code >= 400:
        detail = _stripe_error_detail(response)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Stripe rejected the request: {detail}",
        )

    payload = response.json()
    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Stripe returned an unexpected response.",
        )
    return payload


def _stripe_error_detail(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.text or "Unknown Stripe error."

    error = payload.get("error") if isinstance(payload, dict) else None
    if isinstance(error, dict) and isinstance(error.get("message"), str):
        return error["message"]
    return "Unknown Stripe error."


def _stripe_secret() -> str:
    if settings.STRIPE_SECRET_KEY is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured. Add STRIPE_SECRET_KEY to the backend environment.",
        )
    secret_key = settings.STRIPE_SECRET_KEY.get_secret_value().strip()
    if not secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured. Add STRIPE_SECRET_KEY to the backend environment.",
        )
    return secret_key


def _has_stripe_secret() -> bool:
    return bool(
        settings.STRIPE_SECRET_KEY
        and settings.STRIPE_SECRET_KEY.get_secret_value().strip()
    )
