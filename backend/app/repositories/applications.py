from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.application import Application, SavedBlueprint
from app.models.blueprint import Blueprint
from app.models.user import FounderProfile


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


def list_application_blueprint_applied_at_by_developer(
    db: Session, developer_id: UUID
) -> dict[UUID, datetime]:
    statement = select(Application.blueprint_id, Application.applied_at).where(
        Application.developer_id == developer_id
    )
    return {blueprint_id: applied_at for blueprint_id, applied_at in db.execute(statement).all()}


def list_application_details_by_developer(
    db: Session, developer_id: UUID
) -> dict[UUID, Application]:
    statement = select(Application).where(Application.developer_id == developer_id)
    return {application.blueprint_id: application for application in db.scalars(statement).all()}


def create_application(
    db: Session, developer_id: UUID, blueprint_id: UUID, role: str | None
) -> Application:
    application = Application(developer_id=developer_id, blueprint_id=blueprint_id, role=role)
    db.add(application)
    db.flush()
    return application


def reactivate_application(db: Session, application: Application, role: str | None) -> Application:
    application.role = role
    application.status = "applied"
    application.applied_at = datetime.now(UTC)
    application.withdrawn_at = None
    db.flush()
    return application


def withdraw_application(db: Session, application: Application) -> None:
    application.status = "withdrawn"
    application.withdrawn_at = datetime.now(UTC)
    db.flush()


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
        .options(
            selectinload(SavedBlueprint.blueprint).selectinload(Blueprint.versions),
            selectinload(SavedBlueprint.blueprint)
            .selectinload(Blueprint.founder_profile)
            .selectinload(FounderProfile.user),
        )
        .where(SavedBlueprint.developer_id == developer_id)
        .order_by(SavedBlueprint.saved_at.desc())
        .offset(offset)
        .limit(limit)
    )
    saved = list(db.scalars(statement).all())
    return saved, total


def list_saved_blueprint_ids_for_developer(db: Session, developer_id: UUID) -> set[UUID]:
    statement = select(SavedBlueprint.blueprint_id).where(
        SavedBlueprint.developer_id == developer_id
    )
    return set(db.scalars(statement).all())


def create_saved_blueprint(db: Session, developer_id: UUID, blueprint_id: UUID) -> SavedBlueprint:
    saved = SavedBlueprint(developer_id=developer_id, blueprint_id=blueprint_id)
    db.add(saved)
    db.flush()
    return saved


def delete_saved_blueprint(db: Session, saved: SavedBlueprint) -> None:
    db.delete(saved)
