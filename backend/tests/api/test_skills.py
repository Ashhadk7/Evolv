import pytest
from pydantic import ValidationError

from app.schemas.skills import (
    DomainCreate,
    SkillCreate,
    SkillUpdate,
    TagCreate,
    UserSkillCreate,
)


# ══════════════════════════════════════════════════════════════════════════════
# Skill schema validation tests
# ══════════════════════════════════════════════════════════════════════════════

def test_skill_create_requires_name() -> None:
    """SkillCreate must reject empty name strings."""
    with pytest.raises(ValidationError):
        SkillCreate(name="")


def test_skill_create_rejects_too_long_name() -> None:
    """SkillCreate must reject names exceeding 80 characters."""
    with pytest.raises(ValidationError):
        SkillCreate(name="x" * 81)


def test_skill_create_strips_whitespace() -> None:
    """SkillCreate should strip surrounding whitespace from the name."""
    skill = SkillCreate(name="  Python  ")
    assert skill.name == "Python"


def test_skill_update_requires_name() -> None:
    """SkillUpdate must reject empty name strings."""
    with pytest.raises(ValidationError):
        SkillUpdate(name="")


# ══════════════════════════════════════════════════════════════════════════════
# Tag schema validation tests
# ══════════════════════════════════════════════════════════════════════════════

def test_tag_create_requires_name() -> None:
    """TagCreate must reject empty name strings."""
    with pytest.raises(ValidationError):
        TagCreate(name="")


def test_tag_create_rejects_too_long_name() -> None:
    """TagCreate must reject names exceeding 60 characters."""
    with pytest.raises(ValidationError):
        TagCreate(name="t" * 61)


def test_tag_create_strips_whitespace() -> None:
    """TagCreate should strip surrounding whitespace from the name."""
    tag = TagCreate(name="  HealthTech  ")
    assert tag.name == "HealthTech"


# ══════════════════════════════════════════════════════════════════════════════
# Domain schema validation tests
# ══════════════════════════════════════════════════════════════════════════════

def test_domain_create_requires_name() -> None:
    """DomainCreate must reject empty name strings."""
    with pytest.raises(ValidationError):
        DomainCreate(name="")


def test_domain_create_rejects_too_long_name() -> None:
    """DomainCreate must reject names exceeding 60 characters."""
    with pytest.raises(ValidationError):
        DomainCreate(name="d" * 61)


def test_domain_create_strips_whitespace() -> None:
    """DomainCreate should strip surrounding whitespace from the name."""
    domain = DomainCreate(name="  FinTech  ")
    assert domain.name == "FinTech"


# ══════════════════════════════════════════════════════════════════════════════
# UserSkill schema validation tests
# ══════════════════════════════════════════════════════════════════════════════

def test_user_skill_create_valid() -> None:
    """UserSkillCreate should accept a valid skill_id, kind, and experience_level."""
    us = UserSkillCreate(skill_id=1, kind="Skill", experience_level="1-2 years")
    assert us.skill_id == 1
    assert us.kind == "Skill"
    assert us.experience_level == "1-2 years"


def test_user_skill_create_rejects_zero_skill_id() -> None:
    """UserSkillCreate must reject skill_id < 1."""
    with pytest.raises(ValidationError):
        UserSkillCreate(skill_id=0, kind="Skill", experience_level="Learning")
