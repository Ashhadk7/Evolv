from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.application import Application, SavedBlueprint
from app.models.blueprint import Blueprint, BlueprintVisibility
from app.models.user import DeveloperProfile, FounderProfile


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


def get_latest_active_application_between_founder_and_developer(
    db: Session,
    *,
    founder_id: UUID,
    developer_id: UUID,
) -> Application | None:
    statement = (
        select(Application)
        .join(Blueprint, Blueprint.id == Application.blueprint_id)
        .options(selectinload(Application.blueprint).selectinload(Blueprint.versions))
        .where(
            Blueprint.founder_id == founder_id,
            Application.developer_id == developer_id,
            Application.status == "applied",
        )
        .order_by(Application.applied_at.desc())
        .limit(1)
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
        select(func.count())
        .select_from(Application)
        .where(Application.developer_id == developer_id)
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
    """Live applications for a blueprint (founder-facing).

    Withdrawn rows are excluded so the founder's list and the developer-facing
    applicant count describe the same set of people.
    """
    count_statement = (
        select(func.count())
        .select_from(Application)
        .where(Application.blueprint_id == blueprint_id, Application.status == "applied")
    )
    total = db.scalar(count_statement) or 0

    statement = (
        select(Application)
        .options(selectinload(Application.developer).selectinload(DeveloperProfile.user))
        .where(Application.blueprint_id == blueprint_id, Application.status == "applied")
        .order_by(Application.applied_at.desc())
        .offset(offset)
        .limit(limit)
    )
    applications = list(db.scalars(statement).all())
    return applications, total


def count_applications_for_founder_blueprints(
    db: Session, founder_id: UUID
) -> tuple[dict[UUID, int], dict[UUID, int], int, int]:
    statement = (
        select(
            Application.blueprint_id,
            func.count(Application.id),
            func.count(Application.connection_id),
        )
        .join(Blueprint, Blueprint.id == Application.blueprint_id)
        .where(Blueprint.founder_id == founder_id, Application.status == "applied")
        .group_by(Application.blueprint_id)
    )
    counts: dict[UUID, int] = {}
    in_conversation_counts: dict[UUID, int] = {}
    for blueprint_id, count, in_conversation in db.execute(statement).all():
        counts[blueprint_id] = int(count or 0)
        in_conversation_counts[blueprint_id] = int(in_conversation or 0)

    return (
        counts,
        in_conversation_counts,
        sum(counts.values()),
        sum(in_conversation_counts.values()),
    )


def count_active_applications_by_role(db: Session) -> dict[UUID, dict[str | None, int]]:
    """Applicant counts per public blueprint, broken down by role.

    Developer-facing, so it returns counts only — never who applied. Withdrawn
    applications are excluded: a withdrawn seat is open again.
    """
    statement = (
        select(Application.blueprint_id, Application.role, func.count(Application.id))
        .join(Blueprint, Blueprint.id == Application.blueprint_id)
        .where(
            Blueprint.visibility == BlueprintVisibility.PUBLIC,
            Application.status == "applied",
        )
        .group_by(Application.blueprint_id, Application.role)
    )

    counts: dict[UUID, dict[str | None, int]] = {}
    for blueprint_id, role, count in db.execute(statement).all():
        counts.setdefault(blueprint_id, {})[role] = int(count or 0)
    return counts


def count_public_blueprints_by_founder(db: Session) -> dict[UUID, int]:
    statement = (
        select(Blueprint.founder_id, func.count(Blueprint.id))
        .where(Blueprint.visibility == BlueprintVisibility.PUBLIC)
        .group_by(Blueprint.founder_id)
    )
    return {founder_id: int(count or 0) for founder_id, count in db.execute(statement).all()}


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
    db: Session,
    developer_id: UUID,
    blueprint_id: UUID,
    role: str | None,
    message: str | None = None,
    availability: str | None = None,
) -> Application:
    application = Application(
        developer_id=developer_id,
        blueprint_id=blueprint_id,
        role=role,
        message=message,
        availability=availability,
    )
    db.add(application)
    db.flush()
    return application


def reactivate_application(
    db: Session,
    application: Application,
    role: str | None,
    message: str | None = None,
    availability: str | None = None,
) -> Application:
    application.role = role
    application.message = message
    application.availability = availability
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
