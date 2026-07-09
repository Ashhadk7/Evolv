"""Import SQLAlchemy models here so Alembic can detect them."""

from app.models.messaging import Message, MessageConnection
from app.models.skill import (
    DeveloperTag,
    Domain,
    FounderDomain,
    Skill,
    SkillExperience,
    SkillKind,
    Tag,
    UserSkill,
)
from app.models.user import DeveloperProfile, Education, FounderProfile, User, UserRole
from app.models.connection import Connection, ConnectionStatus
from app.models.certification import Certification

__all__ = [
    "ConnectionStatus",
    "DeveloperProfile",
    "Education",
    "FounderProfile",
    "Message",
    "MessageConnection",
    "Skill",
    "Domain",
    "DeveloperTag",
    "FounderDomain",
    "SkillExperience",
    "SkillKind",
    "Tag",
    "User",
    "UserRole",
    "UserSkill",
    "Connection",
    "Certification",
]
