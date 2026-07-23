"""Import SQLAlchemy models here so Alembic can detect them."""

from app.models.application import Application, SavedBlueprint
from app.models.project import Project, ProjectStatus
from app.models.blueprint import (
    Blueprint,
    BlueprintVersion,
    BlueprintVisibility,
    LevelRating,
    VersionState,
)
from app.models.messaging import Message, MessageConnection
from app.models.google_calendar import GoogleCalendarCredential
from app.models.notification import Notification, NotifType
from app.models.developer_review import DeveloperReview
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
    "Notification",
    "NotifType",
    "Blueprint",
    "BlueprintVersion",
    "BlueprintVisibility",
    "LevelRating",
    "SavedBlueprint",
    "ConnectionStatus",
    "DeveloperProfile",
    "DeveloperReview",
    "Education",
    "FounderProfile",
    "GoogleCalendarCredential",
    "Message",
    "MessageConnection",
    "Project",
    "ProjectStatus",
    "Skill",
    "Domain",
    "DeveloperTag",
    "FounderDomain",
    "SkillExperience",
    "SkillKind",
    "User",
    "UserRole",
    "UserSkill",
    "VersionState",
    "Connection",
    "Certification",
]
