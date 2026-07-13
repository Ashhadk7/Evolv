from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PhoneStatusResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    phone: str | None = None
    phone_verified: bool


class PhoneSendOtpRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    phone: str = Field(min_length=1, max_length=50)


class PhoneSendOtpResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    phone: str
    phone_verified: bool
    message: str


class PhoneVerifyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    phone: str = Field(min_length=1, max_length=50)
    otp: str = Field(min_length=6, max_length=6)

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("OTP must be a 6-digit code.")
        return value


class PhoneVerifyResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    phone: str
    phone_verified: bool
    message: str
