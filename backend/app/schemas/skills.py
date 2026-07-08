from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


SkillName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]
TagName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]
DomainName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]


class SkillCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: SkillName


class SkillUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: SkillName


class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class UserSkillCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    skill_id: int = Field(..., ge=1)
    kind: str
    experience_level: str


class UserSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    skill_id: int
    kind: str
    experience_level: str
    skill: SkillResponse


class TagCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: TagName


class TagUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: TagName


class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class DeveloperTagCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    tag_id: int = Field(..., ge=1)


class DeveloperTagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    tag_id: int
    tag: TagResponse


class DomainCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: DomainName


class DomainUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: DomainName


class DomainResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class FounderDomainCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    domain_id: int = Field(..., ge=1)


class FounderDomainResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    domain_id: int
    domain: DomainResponse
