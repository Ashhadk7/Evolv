from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.blueprint import Blueprint, BlueprintVersion, VersionState
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


def create_blueprint(db: Session, founder_id: UUID, visibility) -> Blueprint:
    blueprint = Blueprint(founder_id=founder_id, visibility=visibility)
    db.add(blueprint)
    db.flush()
    return blueprint


def create_version(
    db: Session,
    blueprint_id: UUID,
    state: VersionState,
    content: BlueprintVersionCreate,
) -> BlueprintVersion:
    version = BlueprintVersion(
        blueprint_id=blueprint_id,
        state=state,
        name=content.name,
        industry=content.industry,
        idea_desc=content.idea_desc,
        differentiator=content.differentiator,
        ai_recommend=content.ai_recommend,
        viability=content.viability,
        market_potential=content.market_potential,
        developer_demand=content.developer_demand,
        content_json=content.content_json,
    )
    db.add(version)
    db.flush()
    return version


def update_version(
    db: Session,
    version: BlueprintVersion,
    content: BlueprintVersionCreate,
) -> BlueprintVersion:
    version.name = content.name
    version.industry = content.industry
    version.idea_desc = content.idea_desc
    version.differentiator = content.differentiator
    version.ai_recommend = content.ai_recommend
    version.viability = content.viability
    version.market_potential = content.market_potential
    version.developer_demand = content.developer_demand
    version.content_json = content.content_json
    db.flush()
    return version


def delete_blueprint(db: Session, blueprint: Blueprint) -> None:
    db.delete(blueprint)
