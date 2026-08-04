from fastapi import APIRouter

from app.api.deps import CurrentDeveloper, DbSession
from app.schemas.stripe_connect import (
    StripeConnectAccountLinkRequest,
    StripeConnectAccountLinkResponse,
    StripeConnectStatusResponse,
)
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
