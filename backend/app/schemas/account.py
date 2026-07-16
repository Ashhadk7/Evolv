from __future__ import annotations

from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, SecretStr, field_validator

from app.schemas.auth import SignupRole

from app.schemas.auth import password_strength_validator


class ChangePasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    current_password: SecretStr = Field(min_length=1, max_length=128)
    new_password: SecretStr = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, value: SecretStr) -> SecretStr:
        return password_strength_validator(value)


class DeleteAccountRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    password: SecretStr = Field(min_length=1, max_length=128)


class MessageResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    message: str


class AccountProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    role: SignupRole
    first_name: str
    last_name: str
    phone: str
    phone_verified: bool
    country: str
    country_code: str
    state_province: str
    city: str
    dob: date
    gender: str | None
    avatar_url: str | None


class AccountProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=50)
    country: str | None = Field(default=None, max_length=100)
    country_code: str | None = Field(default=None, max_length=10)
    state_province: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    dob: date | None = None
    gender: str | None = Field(default=None, max_length=50)
    avatar_url: str | None = None
