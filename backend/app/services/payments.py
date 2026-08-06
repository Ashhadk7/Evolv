"""Payment provider boundary for manual ledger entries and Stripe Checkout."""

import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Protocol
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.project import PaymentProvider, PaymentStatus
from app.models.user import User
from app.repositories import projects as projects_repository
from app.services import stripe_connect
from app.services.exceptions import ProjectMemberConflictError, ProjectPersistenceError


@dataclass(frozen=True)
class PayoutResult:
    status: PaymentStatus
    provider: PaymentProvider
    provider_ref: str | None = None
    failure_reason: str | None = None

    @property
    def is_settled(self) -> bool:
        return self.status == PaymentStatus.SUCCEEDED


class PaymentProviderPort(Protocol):
    def requires_onboarding(self, founder: User) -> bool: ...

    def create_payout(
        self, *, member_id: UUID, amount_cents: int, idempotency_key: str
    ) -> PayoutResult: ...


class ManualLedgerProvider:
    """Bookkeeping only: the founder asserts a payment was made off-platform.

    Nothing is transferred, so the entry settles immediately and is surfaced to
    the developer as founder-reported rather than as money received.
    """

    def requires_onboarding(self, founder: User) -> bool:
        return False

    def create_payout(
        self, *, member_id: UUID, amount_cents: int, idempotency_key: str
    ) -> PayoutResult:
        return PayoutResult(status=PaymentStatus.SUCCEEDED, provider=PaymentProvider.MANUAL)


_provider: PaymentProviderPort = ManualLedgerProvider()


def get_provider() -> PaymentProviderPort:
    return _provider


@dataclass(frozen=True)
class CheckoutSessionResult:
    session_id: str
    url: str


PAYMENT_COUNTED_STATUSES = (
    PaymentStatus.PENDING,
    PaymentStatus.PROCESSING,
    PaymentStatus.SUCCEEDED,
)
WEBHOOK_TOLERANCE_SECONDS = 300


def developer_stripe_ready(profile: object | None) -> bool:
    return bool(
        profile
        and getattr(profile, "stripe_account_id", None)
        and getattr(profile, "stripe_onboarding_complete", False)
        and getattr(profile, "stripe_payouts_enabled", False)
    )


def create_checkout_session(
    db: Session,
    *,
    project_id: UUID,
    member_id: UUID,
    developer_account_id: str,
    developer_name: str,
    project_title: str,
    phase_index: int,
    founder: User,
    amount_cents: int,
    currency: str,
    idempotency_key: str,
    success_url: str,
    cancel_url: str,
) -> CheckoutSessionResult:
    existing = projects_repository.get_payment_by_idempotency_key(db, idempotency_key)
    if existing is not None and existing.provider_ref:
        session = stripe_connect._stripe_get(f"/checkout/sessions/{existing.provider_ref}")
        url = session.get("url")
        if not isinstance(url, str) or not url:
            raise ProjectMemberConflictError("That payment session can no longer be opened.")
        return CheckoutSessionResult(session_id=existing.provider_ref, url=url)

    platform_fee_cents = min(
        amount_cents,
        round(amount_cents * settings.STRIPE_PLATFORM_FEE_BPS / 10000),
    )

    try:
        payment = projects_repository.create_payment(
            db,
            project_id=project_id,
            member_id=member_id,
            amount_cents=amount_cents,
            currency=currency,
            status=PaymentStatus.PROCESSING,
            provider=PaymentProvider.STRIPE,
            provider_ref=None,
            idempotency_key=idempotency_key,
            initiated_by=founder.id,
            failure_reason=None,
            settled_at=None,
        )

        session = stripe_connect._stripe_post(
            "/checkout/sessions",
            {
                "mode": "payment",
                "success_url": success_url,
                "cancel_url": cancel_url,
                "client_reference_id": str(payment.id),
                "customer_email": founder.email,
                "line_items[0][price_data][currency]": currency.lower(),
                "line_items[0][price_data][product_data][name]": (
                    f"{project_title} - Phase {phase_index + 1} payment"
                ),
                "line_items[0][price_data][product_data][description]": (
                    f"Payment to {developer_name} through Evolv"
                ),
                "line_items[0][price_data][unit_amount]": str(amount_cents),
                "line_items[0][quantity]": "1",
                "payment_intent_data[application_fee_amount]": str(platform_fee_cents),
                "payment_intent_data[transfer_data][destination]": developer_account_id,
                "payment_intent_data[metadata][evolv_payment_id]": str(payment.id),
                "payment_intent_data[metadata][project_id]": str(project_id),
                "payment_intent_data[metadata][member_id]": str(member_id),
                "metadata[evolv_payment_id]": str(payment.id),
                "metadata[project_id]": str(project_id),
                "metadata[member_id]": str(member_id),
            },
            idempotency_key=idempotency_key,
        )

        session_id = str(session["id"])
        url = session.get("url")
        if not isinstance(url, str) or not url:
            raise ProjectPersistenceError("Stripe did not return a checkout URL.")

        payment.provider_ref = session_id
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ProjectMemberConflictError("That payment has already been started.") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError("The payment session could not be saved.") from exc
    except Exception:
        db.rollback()
        raise

    return CheckoutSessionResult(session_id=session_id, url=url)


def sync_checkout_session(
    db: Session,
    *,
    session_id: str,
    cancel_requested: bool = False,
) -> None:
    payment = projects_repository.get_payment_by_provider_ref(db, session_id)
    if payment is None:
        raise ProjectMemberConflictError("Payment session was not found.")

    session = stripe_connect._stripe_get(f"/checkout/sessions/{session_id}")
    status_value = str(session.get("status") or "")
    payment_status = str(session.get("payment_status") or "")
    payment_intent = session.get("payment_intent")

    if cancel_requested and payment_status != "paid" and status_value == "open":
        session = stripe_connect._stripe_post(f"/checkout/sessions/{session_id}/expire", {})
        status_value = str(session.get("status") or status_value)
        payment_status = str(session.get("payment_status") or payment_status)
        payment_intent = session.get("payment_intent")

    if payment_status == "paid":
        projects_repository.update_payment_status(
            payment,
            status=PaymentStatus.SUCCEEDED,
            provider_ref=session_id,
            failure_reason=None,
            settled_at=payment.settled_at or _now(),
        )
    elif cancel_requested:
        projects_repository.update_payment_status(
            payment,
            status=PaymentStatus.CANCELLED,
            provider_ref=session_id,
            failure_reason="Checkout was cancelled before payment.",
            settled_at=None,
        )
    elif status_value == "expired":
        projects_repository.update_payment_status(
            payment,
            status=PaymentStatus.CANCELLED,
            provider_ref=session_id,
            failure_reason="Checkout session expired before payment.",
            settled_at=None,
        )
    elif payment_status in {"unpaid", "no_payment_required"} and payment_intent is None:
        projects_repository.update_payment_status(
            payment,
            status=PaymentStatus.PROCESSING,
            provider_ref=session_id,
            failure_reason=None,
            settled_at=None,
        )

    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError("Payment status could not be updated.") from exc


def handle_checkout_webhook(db: Session, payload: bytes, signature: str | None) -> None:
    event = _parse_webhook_event(payload, signature)
    event_type = event.get("type")
    data = event.get("data")
    obj = data.get("object") if isinstance(data, dict) else None
    if not isinstance(obj, dict):
        return

    session_id = obj.get("id")
    if not isinstance(session_id, str):
        return

    payment = projects_repository.get_payment_by_provider_ref(db, session_id)
    if payment is None:
        return

    if event_type in {"checkout.session.completed", "checkout.session.async_payment_succeeded"}:
        if obj.get("payment_status") == "paid":
            projects_repository.update_payment_status(
                payment,
                status=PaymentStatus.SUCCEEDED,
                provider_ref=session_id,
                failure_reason=None,
                settled_at=payment.settled_at or _now(),
            )
    elif event_type in {"checkout.session.expired", "checkout.session.async_payment_failed"}:
        projects_repository.update_payment_status(
            payment,
            status=PaymentStatus.FAILED
            if event_type == "checkout.session.async_payment_failed"
            else PaymentStatus.CANCELLED,
            provider_ref=session_id,
            failure_reason="Stripe checkout did not complete.",
            settled_at=None,
        )
    else:
        return

    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError("Payment webhook could not be saved.") from exc


def _parse_webhook_event(payload: bytes, signature: str | None) -> dict[str, object]:
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET
    if webhook_secret and webhook_secret.get_secret_value().strip():
        _verify_signature(payload, signature, webhook_secret.get_secret_value().strip())
    elif settings.ENVIRONMENT != "local":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe webhook signing secret is not configured.",
        )

    try:
        parsed = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Stripe webhook payload.",
        ) from exc
    if not isinstance(parsed, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Stripe webhook event.",
        )
    return parsed


def _verify_signature(payload: bytes, signature: str | None, secret: str) -> None:
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature.",
        )

    parts = {
        key: value
        for item in signature.split(",")
        if "=" in item
        for key, value in [item.split("=", 1)]
    }
    timestamp = parts.get("t")
    expected = parts.get("v1")
    if not timestamp or not expected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Stripe signature.",
        )

    try:
        signed_at = int(timestamp)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Stripe signature.",
        ) from exc

    if abs(time.time() - signed_at) > WEBHOOK_TOLERANCE_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expired Stripe signature.",
        )

    signed_payload = timestamp.encode() + b"." + payload
    digest = hmac.new(secret.encode(), signed_payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(digest, expected):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Stripe signature.",
        )


def _now() -> datetime:
    return datetime.now(UTC)
