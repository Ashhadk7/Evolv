from __future__ import annotations

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field


class StripeConnectAccountLinkRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    refresh_url: AnyHttpUrl
    return_url: AnyHttpUrl


class StripeConnectStatusResponse(BaseModel):
    account_id: str | None = None
    onboarding_complete: bool = False
    charges_enabled: bool = False
    payouts_enabled: bool = False
    currently_due: list[str] = Field(default_factory=list)
    disabled_reason: str | None = None


class StripeConnectAccountLinkResponse(StripeConnectStatusResponse):
    url: str
