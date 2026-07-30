from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.educations import EducationCreate, EducationResponse


class FounderProfileBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    headline: str | None = Field(None, max_length=255)
    bio: str | None = None
    description: str | None = None
    linkedin: str | None = Field(None, max_length=255)
    venture_stage: str | None = Field(None, max_length=100)
    primary_goal: str = Field(default="not_selected", max_length=100)
    domains: list[str] = Field(default_factory=list, max_length=50)
    profile_complete: bool = False
    stripe_connected: bool = False
    billing_plan: str | None = Field(None, max_length=100)
    billing_email: EmailStr | None = None
    billing_currency: str | None = Field(None, max_length=10)
    billing_budget_range: str | None = Field(None, max_length=100)
    payment_method: str | None = Field(None, max_length=50)
    billing_company_name: str | None = Field(None, max_length=255)


class FounderProfileCreate(FounderProfileBase):
    educations: list[EducationCreate] = Field(default_factory=list, max_length=20)


class FounderProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    headline: str | None = Field(None, max_length=255)
    bio: str | None = None
    description: str | None = None
    linkedin: str | None = Field(None, max_length=255)
    venture_stage: str | None = Field(None, max_length=100)
    primary_goal: str | None = Field(None, max_length=100)
    domains: list[str] | None = Field(None, max_length=50)
    profile_complete: bool | None = None
    stripe_connected: bool | None = None
    billing_plan: str | None = Field(None, max_length=100)
    billing_email: EmailStr | None = None
    billing_currency: str | None = Field(None, max_length=10)
    billing_budget_range: str | None = Field(None, max_length=100)
    payment_method: str | None = Field(None, max_length=50)
    billing_company_name: str | None = Field(None, max_length=255)
    educations: list[EducationCreate] | None = Field(None, max_length=20)


class FounderProfileResponse(FounderProfileBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    educations: list[EducationResponse] = Field(default_factory=list)
