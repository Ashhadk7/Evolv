from fastapi import APIRouter, Header, Request

from app.api.deps import CurrentDeveloper, DbSession
from app.schemas.stripe_connect import (
    StripeConnectAccountLinkRequest,
    StripeConnectAccountLinkResponse,
    StripeConnectStatusResponse,
)
from app.services import payments as payments_service
from app.services import stripe_connect as stripe_connect_service

router = APIRouter()


@router.get("/stripe/connect/status", response_model=StripeConnectStatusResponse)
def get_stripe_connect_status(
    db: DbSession,
    current_user: CurrentDeveloper,
) -> StripeConnectStatusResponse:
    return stripe_connect_service.get_developer_connect_status(db, current_user=current_user)


@router.post("/stripe/connect/account-link", response_model=StripeConnectAccountLinkResponse)
def create_stripe_connect_account_link(
    payload: StripeConnectAccountLinkRequest,
    db: DbSession,
    current_user: CurrentDeveloper,
) -> StripeConnectAccountLinkResponse:
    return stripe_connect_service.create_developer_account_link(
        db,
        current_user=current_user,
        payload=payload,
    )


@router.post("/stripe/webhook")
async def handle_stripe_webhook(
    request: Request,
    db: DbSession,
    stripe_signature: str | None = Header(default=None, alias="Stripe-Signature"),
) -> dict[str, bool]:
    payload = await request.body()
    payments_service.handle_checkout_webhook(db, payload, stripe_signature)
    return {"received": True}
