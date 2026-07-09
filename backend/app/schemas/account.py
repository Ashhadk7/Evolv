from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, SecretStr, field_validator

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