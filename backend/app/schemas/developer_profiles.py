from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.educations import EducationCreate, EducationResponse
from app.schemas.certifications import CertificationCreate, CertificationResponse
from app.schemas.developer_reviews import DeveloperReviewResponse


class DeveloperProfileBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_title: str | None = Field(None, max_length=255)
    bio: str | None = None
    experience_years: int | None = Field(None, ge=0, le=80)
    availability: bool = True
    open_to_remote: bool = False
    preferred_budget: str | None = Field(None, max_length=100)
    github: str | None = Field(None, max_length=255)
    linkedin: str | None = Field(None, max_length=255)
    portfolio_link: str | None = Field(None, max_length=255)
    skills: list[str] = Field(default_factory=list, max_length=100)
    profile_complete: bool = False


class DeveloperProfileCreate(DeveloperProfileBase):
    educations: list[EducationCreate] = Field(default_factory=list, max_length=20)
    certifications: list[CertificationCreate] = Field(default_factory=list, max_length=20)


class DeveloperProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_title: str | None = Field(None, max_length=255)
    bio: str | None = None
    experience_years: int | None = Field(None, ge=0, le=80)
    availability: bool | None = None
    open_to_remote: bool | None = None
    preferred_budget: str | None = Field(None, max_length=100)
    github: str | None = Field(None, max_length=255)
    linkedin: str | None = Field(None, max_length=255)
    portfolio_link: str | None = Field(None, max_length=255)
    skills: list[str] | None = Field(None, max_length=100)
    profile_complete: bool | None = None
    educations: list[EducationCreate] | None = Field(None, max_length=20)
    certifications: list[CertificationCreate] | None = Field(None, max_length=20)


class DeveloperProfileResponse(DeveloperProfileBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    rating_avg: float
    educations: list[EducationResponse] = Field(default_factory=list)
    certifications: list[CertificationResponse] = Field(default_factory=list)
    reviews: list[DeveloperReviewResponse] = Field(default_factory=list)
