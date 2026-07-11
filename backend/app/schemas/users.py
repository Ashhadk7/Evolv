from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.schemas.auth import SignupRole
from app.schemas.certifications import CertificationResponse
from app.schemas.developer_reviews import DeveloperReviewCreate, DeveloperReviewResponse
from app.schemas.educations import EducationResponse


class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    role: SignupRole
    first_name: str
    last_name: str
    country: str | None = None
    country_code: str | None = None
    city: str | None = None
    avatar_url: str | None = None
    phone_verified: bool
    profile_title: str | None = None
    profile_bio: str | None = None
    profile_complete: bool
    discovery_tags: list[str]
    created_at: datetime

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, value: Any) -> Any:
        if isinstance(value, Enum):
            return value.value
        return value


class UserListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[UserSummary]


class PublicFounderProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    headline: str | None = None
    bio: str | None = None
    description: str | None = None
    linkedin: str | None = None
    venture_stage: str | None = None
    primary_goal: str | None = None
    domains: list[str] = Field(default_factory=list)
    profile_complete: bool
    educations: list[EducationResponse] = Field(default_factory=list)


class PublicDeveloperProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_title: str | None = None
    bio: str | None = None
    experience_years: int | None = None
    availability: bool
    open_to_remote: bool
    preferred_budget: str | None = None
    github: str | None = None
    linkedin: str | None = None
    portfolio_link: str | None = None
    skills: list[str] = Field(default_factory=list)
    rating_avg: float
    profile_complete: bool
    educations: list[EducationResponse] = Field(default_factory=list)
    certifications: list[CertificationResponse] = Field(default_factory=list)
    reviews: list[DeveloperReviewResponse] = Field(default_factory=list)


class PublicUserProfile(UserSummary):
    founder_profile: PublicFounderProfile | None = None
    developer_profile: PublicDeveloperProfile | None = None


class DeveloperReviewRequest(DeveloperReviewCreate):
    pass
