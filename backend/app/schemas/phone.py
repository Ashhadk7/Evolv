from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class PhoneStatusResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    phone: str | None = None
    phone_verified: bool


class PhoneVerifyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    firebase_id_token: str = Field(min_length=1)


class PhoneVerifyResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    phone: str
    phone_verified: bool
    message: str
