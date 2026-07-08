from __future__ import annotations

from datetime import UTC, date, datetime
from enum import StrEnum
from typing import Any
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    HttpUrl,
    SecretStr,
    field_validator,
)


class SignupRole(StrEnum):
    FOUNDER = "founder"
    DEVELOPER = "developer"


class SignupRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: SignupRole
    email: EmailStr
    password: SecretStr = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=50)
    country: str | None = Field(None, max_length=100)
    country_code: str | None = Field(None, max_length=10)
    state_province: str | None = Field(None, max_length=100)
    city: str | None = Field(None, max_length=100)
    dob: date | None = None
    gender: str | None = Field(None, max_length=50)
    avatar_url: HttpUrl | None = None
    terms_accepted: bool

    @field_validator(
        "first_name",
        "last_name",
        "phone",
        "country",
        "country_code",
        "state_province",
        "city",
        "gender",
        mode="before",
    )
    @classmethod
    def strip_short_text(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("first_name", "last_name")
    @classmethod
    def require_non_empty_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not value:
            raise ValueError("Name fields cannot be blank.")
        return value

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: SecretStr) -> SecretStr:
        password = value.get_secret_value()
        has_lower = any(character.islower() for character in password)
        has_upper = any(character.isupper() for character in password)
        has_digit = any(character.isdigit() for character in password)

        if not (has_lower and has_upper and has_digit):
            raise ValueError("Password must include uppercase, lowercase, and number characters.")
        return value

    @field_validator("terms_accepted")
    @classmethod
    def require_terms(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Terms must be accepted before signup.")
        return value

    @property
    def terms_accepted_at(self) -> datetime:
        return datetime.now(UTC)


class SignupResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    email: EmailStr
    role: SignupRole
    first_name: str
    last_name: str
    email_confirmed: bool
    message: str


class SignupStartResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    expires_at: datetime
    message: str
    debug_otp: str | None = None


class SignupVerifyEmailRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")


class SignupResendOtpRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr


class SigninRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: SecretStr = Field(min_length=1, max_length=128)


class SigninResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    email: EmailStr
    role: SignupRole
    first_name: str
    last_name: str
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    expires_at: int
