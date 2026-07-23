from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.application import Application, SavedBlueprint


def get_application_by_id(db: Session, application_id: UUID) -> Application | None:
    statement = select(Application).where(Application.id == application_id)
    return db.scalar(statement)


def get_application_by_developer_and_blueprint(
    db: Session, developer_id: UUID, blueprint_id: UUID
) -> Application | None:
    statement = select(Application).where(
        Application.developer_id == developer_id,
        Application.blueprint_id == blueprint_id,
    )
    return db.scalar(statement)


def list_applications_for_developer(
    db: Session,
    developer_id: UUID,
    *,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Application], int]:
    count_statement = (
        select(func.count()).select_from(Application).where(Application.developer_id == developer_id)
    )
    total = db.scalar(count_statement) or 0

    statement = (
        select(Application)
        .where(Application.developer_id == developer_id)
        .order_by(Application.applied_at.desc())
        .offset(offset)
        .limit(limit)
    )
    applications = list(db.scalars(statement).all())
    return applications, total


def list_applications_for_blueprint(
    db: Session,
    blueprint_id: UUID,
    *,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Application], int]:
    """Return all applications for a specific blueprint (founder-facing)."""
    count_statement = (
        select(func.count())
        .select_from(Application)
        .where(Application.blueprint_id == blueprint_id)
    )
    total = db.scalar(count_statement) or 0

    statement = (
        select(Application)
        .options(selectinload(Application.developer))
        .where(Application.blueprint_id == blueprint_id)
        .order_by(Application.applied_at.desc())
        .offset(offset)
        .limit(limit)
    )
    applications = list(db.scalars(statement).all())
    return applications, total



def create_application(db: Session, developer_id: UUID, blueprint_id: UUID) -> Application:
    application = Application(developer_id=developer_id, blueprint_id=blueprint_id)
    db.add(application)
    db.flush()
    return application


def delete_application(db: Session, application: Application) -> None:
    db.delete(application)


def get_saved_blueprint(
    db: Session, developer_id: UUID, blueprint_id: UUID
) -> SavedBlueprint | None:
    statement = select(SavedBlueprint).where(
        SavedBlueprint.developer_id == developer_id,
        SavedBlueprint.blueprint_id == blueprint_id,
    )
    return db.scalar(statement)


def list_saved_blueprints_for_developer(
    db: Session,
    developer_id: UUID,
    *,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[SavedBlueprint], int]:
    count_statement = (
        select(func.count())
        .select_from(SavedBlueprint)
        .where(SavedBlueprint.developer_id == developer_id)
    )
    total = db.scalar(count_statement) or 0

    statement = (
        select(SavedBlueprint)
        .where(SavedBlueprint.developer_id == developer_id)
        .order_by(SavedBlueprint.saved_at.desc())
        .offset(offset)
        .limit(limit)
    )
    saved = list(db.scalars(statement).all())
    return saved, total


def create_saved_blueprint(db: Session, developer_id: UUID, blueprint_id: UUID) -> SavedBlueprint:
    saved = SavedBlueprint(developer_id=developer_id, blueprint_id=blueprint_id)
    db.add(saved)
    db.flush()
    return saved


def delete_saved_blueprint(db: Session, saved: SavedBlueprint) -> None:
    db.delete(saved)
