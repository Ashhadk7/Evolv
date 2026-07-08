from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class EducationBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    level: str = Field(min_length=1, max_length=100)
    degree: str | None = Field(None, max_length=255)
    custom_degree: str | None = Field(None, max_length=255)
    school: str = Field(min_length=1, max_length=255)

    @field_validator("level", "degree", "custom_degree", "school", mode="before")
    @classmethod
    def strip_text(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value


class EducationCreate(EducationBase):
    pass


class EducationResponse(EducationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
