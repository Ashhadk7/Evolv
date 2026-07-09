from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CertificationBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., max_length=255)
    issuer: str = Field(..., max_length=255)
    issue_date: str | None = Field(None, max_length=50)
    credential_id: str | None = Field(None, max_length=100)
    credential_url: str | None = Field(None, max_length=500)


class CertificationCreate(CertificationBase):
    pass


class CertificationResponse(CertificationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
