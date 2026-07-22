from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.blueprint import Blueprint, BlueprintVersion, BlueprintVisibility, VersionState
from app.models.user import FounderProfile
from app.schemas.blueprints import BlueprintVersionCreate


def get_blueprint_by_id(db: Session, blueprint_id: UUID) -> Blueprint | None:
    statement = (
        select(Blueprint)
        .options(selectinload(Blueprint.versions))
        .where(Blueprint.id == blueprint_id)
    )
    return db.scalar(statement)


def list_blueprints_for_founder(
    db: Session,
    founder_id: UUID,
    *,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Blueprint], int]:
    count_statement = select(func.count()).select_from(Blueprint).where(
        Blueprint.founder_id == founder_id
    )
    total = db.scalar(count_statement) or 0

    statement = (
        select(Blueprint)
        .options(selectinload(Blueprint.versions))
        .where(Blueprint.founder_id == founder_id)
        .order_by(Blueprint.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    blueprints = list(db.scalars(statement).all())
    return blueprints, total


def list_public_blueprints(db: Session) -> list[Blueprint]:
    statement = (
        select(Blueprint)
        .options(
            selectinload(Blueprint.versions),
            selectinload(Blueprint.founder_profile).selectinload(FounderProfile.user),
        )
        .where(Blueprint.visibility == BlueprintVisibility.PUBLIC)
        .order_by(Blueprint.updated_at.desc())
    )
    return list(db.scalars(statement).all())


def create_blueprint(db: Session, founder_id: UUID, visibility) -> Blueprint:
    blueprint = Blueprint(founder_id=founder_id, visibility=visibility)
    db.add(blueprint)
    db.flush()
    return blueprint


def get_version_by_state(
    db: Session, blueprint_id: UUID, state: VersionState
) -> BlueprintVersion | None:
    statement = select(BlueprintVersion).where(
        BlueprintVersion.blueprint_id == blueprint_id,
        BlueprintVersion.state == state,
    )
    return db.scalar(statement)


_BLUEPRINT_VERSION_FIELDS = (
    "name",
    "industry",
    "idea_desc",
    "differentiator",
    "ai_recommend",
    "viability",
    "market_potential",
    "developer_demand",
    "content_json",
)


def _apply_version_content(version: BlueprintVersion, content: BlueprintVersionCreate) -> None:
    for field in _BLUEPRINT_VERSION_FIELDS:
        setattr(version, field, getattr(content, field))


def create_version(
    db: Session,
    blueprint_id: UUID,
    state: VersionState,
    content: BlueprintVersionCreate,
) -> BlueprintVersion:
    version = BlueprintVersion(blueprint_id=blueprint_id, state=state)
    _apply_version_content(version, content)
    db.add(version)
    db.flush()
    return version


def update_version(
    db: Session,
    version: BlueprintVersion,
    content: BlueprintVersionCreate,
) -> BlueprintVersion:
    _apply_version_content(version, content)
    db.flush()
    return version


def delete_blueprint(db: Session, blueprint: Blueprint) -> None:
    db.delete(blueprint)
