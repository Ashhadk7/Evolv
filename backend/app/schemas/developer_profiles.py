from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.educations import EducationCreate, EducationResponse


class DeveloperProfileBase(BaseModel):
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
    profile_complete: bool = False

    @field_validator(
        "job_title",
        "bio",
        "preferred_budget",
        "github",
        "linkedin",
        "portfolio_link",
        mode="before",
    )
    @classmethod
    def strip_optional_text(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value


class DeveloperProfileCreate(DeveloperProfileBase):
    educations: list[EducationCreate] = Field(default_factory=list, max_length=20)


class DeveloperProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_title: str | None = Field(default=None, max_length=255)
    bio: str | None = None
    experience_years: int | None = Field(default=None, ge=0, le=80)
    availability: bool | None = None
    open_to_remote: bool | None = None
    preferred_budget: str | None = Field(default=None, max_length=100)
    github: str | None = Field(default=None, max_length=255)
    linkedin: str | None = Field(default=None, max_length=255)
    portfolio_link: str | None = Field(default=None, max_length=255)
    profile_complete: bool | None = None
    educations: list[EducationCreate] | None = Field(default=None, max_length=20)

    @field_validator(
        "job_title",
        "bio",
        "preferred_budget",
        "github",
        "linkedin",
        "portfolio_link",
        mode="before",
    )
    @classmethod
    def strip_optional_text(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value


class DeveloperProfileResponse(DeveloperProfileBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    rating_avg: float
    educations: list[EducationResponse] = Field(default_factory=list)
