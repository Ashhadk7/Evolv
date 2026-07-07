from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


# ── Shared constraints ──────────────────────────────────────────────────────────

SkillName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]
TagName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]
DomainName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]


# ══════════════════════════════════════════════════════════════════════════════
# Skills
# ══════════════════════════════════════════════════════════════════════════════

class SkillCreate(BaseModel):
    """Payload for creating a new global skill entry."""

    model_config = ConfigDict(extra="forbid")

    name: SkillName


class SkillUpdate(BaseModel):
    """Payload for renaming an existing skill."""

    model_config = ConfigDict(extra="forbid")

    name: SkillName


class SkillResponse(BaseModel):
    """Public representation of a skill row."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class SkillListResponse(BaseModel):
    """Paginated list of skills."""

    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[SkillResponse]


# ── User-skill (many-to-many) ──────────────────────────────────────────────────

class UserSkillCreate(BaseModel):
    """Payload when a user adds a skill to their profile."""

    model_config = ConfigDict(extra="forbid")

    skill_id: int = Field(..., ge=1)
    kind: str = Field(..., description="Skill | Tech stack | Framework | Tool")
    experience_level: str = Field(..., description="Learning | < 1 year | 1-2 years | 3-5 years | 5+ years")


class UserSkillResponse(BaseModel):
    """Skill row as seen from a user's profile."""

    model_config = ConfigDict(from_attributes=True)

    skill_id: int
    kind: str
    experience_level: str
    skill: SkillResponse


# ══════════════════════════════════════════════════════════════════════════════
# Tags
# ══════════════════════════════════════════════════════════════════════════════

class TagCreate(BaseModel):
    """Payload for creating a new global tag."""

    model_config = ConfigDict(extra="forbid")

    name: TagName


class TagUpdate(BaseModel):
    """Payload for renaming an existing tag."""

    model_config = ConfigDict(extra="forbid")

    name: TagName


class TagResponse(BaseModel):
    """Public representation of a tag row."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class TagListResponse(BaseModel):
    """Paginated list of tags."""

    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[TagResponse]


# ── Developer-tag (many-to-many) ───────────────────────────────────────────────

class DeveloperTagCreate(BaseModel):
    """Payload when a developer adds a tag to their profile."""

    model_config = ConfigDict(extra="forbid")

    tag_id: int = Field(..., ge=1)


class DeveloperTagResponse(BaseModel):
    """Tag row as seen from a developer's profile."""

    model_config = ConfigDict(from_attributes=True)

    tag_id: int
    tag: TagResponse


# ══════════════════════════════════════════════════════════════════════════════
# Domains
# ══════════════════════════════════════════════════════════════════════════════

class DomainCreate(BaseModel):
    """Payload for creating a new global domain."""

    model_config = ConfigDict(extra="forbid")

    name: DomainName


class DomainUpdate(BaseModel):
    """Payload for renaming an existing domain."""

    model_config = ConfigDict(extra="forbid")

    name: DomainName


class DomainResponse(BaseModel):
    """Public representation of a domain row."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class DomainListResponse(BaseModel):
    """Paginated list of domains."""

    model_config = ConfigDict(extra="forbid")

    total: int
    limit: int
    offset: int
    items: list[DomainResponse]


# ── Founder-domain (many-to-many) ──────────────────────────────────────────────

class FounderDomainCreate(BaseModel):
    """Payload when a founder adds a domain interest to their profile."""

    model_config = ConfigDict(extra="forbid")

    domain_id: int = Field(..., ge=1)


class FounderDomainResponse(BaseModel):
    """Domain row as seen from a founder's profile."""

    model_config = ConfigDict(from_attributes=True)

    domain_id: int
    domain: DomainResponse
