from __future__ import annotations

from datetime import UTC, date, datetime
from enum import Enum
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
    model_validator,
)


class SignupRole(str, Enum):
    FOUNDER = "founder"
    DEVELOPER = "developer"


class FounderSignupDetails(BaseModel):
    model_config = ConfigDict(extra="forbid")

    headline: str | None = Field(default=None, max_length=255)
    bio: str | None = None
    description: str | None = None
    linkedin: str | None = Field(default=None, max_length=255)
    venture_stage: str | None = Field(default=None, max_length=100)
    primary_goal: str | None = Field(default=None, max_length=100)


class DeveloperSignupDetails(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_title: str | None = Field(default=None, max_length=255)
    bio: str | None = None
    experience_years: int | None = Field(default=None, ge=0, le=80)
    availability: bool = True
    open_to_remote: bool = False
    preferred_budget: str | None = Field(default=None, max_length=100)
    github: str | None = Field(default=None, max_length=255)
    linkedin: str | None = Field(default=None, max_length=255)
    portfolio_link: str | None = Field(default=None, max_length=255)


class SignupRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: SignupRole
    email: EmailStr
    password: SecretStr = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=50)
    country: str | None = Field(default=None, max_length=100)
    country_code: str | None = Field(default=None, max_length=10)
    state_province: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    dob: date | None = None
    gender: str | None = Field(default=None, max_length=50)
    avatar_url: HttpUrl | None = None
    terms_accepted: bool
    founder_details: FounderSignupDetails | None = None
    developer_details: DeveloperSignupDetails | None = None

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

    @model_validator(mode="after")
    def validate_role_details(self) -> SignupRequest:
        if self.role == SignupRole.FOUNDER and self.developer_details is not None:
            raise ValueError("Founder signup cannot include developer_details.")
        if self.role == SignupRole.DEVELOPER and self.founder_details is not None:
            raise ValueError("Developer signup cannot include founder_details.")
        return self

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
    refresh_token: str | None = None
    token_type: str = "bearer"
    expires_in: int | None = None
    expires_at: int | None = None
