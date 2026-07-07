from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.educations import EducationCreate, EducationResponse


class FounderProfileBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    headline: str | None = Field(default=None, max_length=255)
    bio: str | None = None
    description: str | None = None
    linkedin: str | None = Field(default=None, max_length=255)
    venture_stage: str | None = Field(default=None, max_length=100)
    primary_goal: str | None = Field(default=None, max_length=100)
    profile_complete: bool = False

    @field_validator(
        "headline",
        "bio",
        "description",
        "linkedin",
        "venture_stage",
        "primary_goal",
        mode="before",
    )
    @classmethod
    def strip_optional_text(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value


class FounderProfileCreate(FounderProfileBase):
    educations: list[EducationCreate] = Field(default_factory=list, max_length=20)


class FounderProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    headline: str | None = Field(default=None, max_length=255)
    bio: str | None = None
    description: str | None = None
    linkedin: str | None = Field(default=None, max_length=255)
    venture_stage: str | None = Field(default=None, max_length=100)
    primary_goal: str | None = Field(default=None, max_length=100)
    profile_complete: bool | None = None
    educations: list[EducationCreate] | None = Field(default=None, max_length=20)

    @field_validator(
        "headline",
        "bio",
        "description",
        "linkedin",
        "venture_stage",
        "primary_goal",
        mode="before",
    )
    @classmethod
    def strip_optional_text(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value


class FounderProfileResponse(FounderProfileBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    stripe_connected: bool
    educations: list[EducationResponse] = Field(default_factory=list)
