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
from app.models.connection import Connection, ConnectionStatus
from app.models.certification import Certification

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
    "Connection",
    "ConnectionStatus",
    "Certification",
]
