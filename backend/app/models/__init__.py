"""Import SQLAlchemy models here so Alembic can detect them."""

from app.models.user import DeveloperProfile, Education, FounderProfile, User, UserRole
from app.models.skill import (
    Skill,
    UserSkill,
    Tag,
    DeveloperTag,
    Domain,
    FounderDomain,
    SkillKind,
    SkillExperience,
)

__all__ = [
    "DeveloperProfile",
    "Education",
    "FounderProfile",
    "User",
    "UserRole",
    "Skill",
    "UserSkill",
    "Tag",
    "DeveloperTag",
    "Domain",
    "FounderDomain",
    "SkillKind",
    "SkillExperience",
]
