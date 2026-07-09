"""Import SQLAlchemy models here so Alembic can detect them."""

from app.models.application import Application, SavedBlueprint
from app.models.blueprint import (
    Blueprint,
    BlueprintVersion,
    BlueprintVisibility,
    LevelRating,
    VersionState,
)
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

__all__ = [
    "Application",
    "Blueprint",
    "BlueprintVersion",
    "BlueprintVisibility",
    "DeveloperProfile",
    "DeveloperTag",
    "Domain",
    "Education",
    "FounderDomain",
    "FounderProfile",
    "LevelRating",
    "SavedBlueprint",
    "Skill",
    "SkillExperience",
    "SkillKind",
    "Tag",
    "User",
    "UserRole",
    "UserSkill",
    "VersionState",
]
