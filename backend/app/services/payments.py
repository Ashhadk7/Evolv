"""Payment provider boundary.

The Stripe integration lands as a second implementation of ``PaymentProvider``
plus a webhook that advances ``processing`` to ``succeeded`` or ``failed``. No
schema, endpoint or response shape changes when it does.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol
from uuid import UUID

from app.models.project import PaymentProvider, PaymentStatus
from app.models.user import User


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
