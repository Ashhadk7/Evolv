from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.application import Application, SavedBlueprint
from app.models.blueprint import Blueprint, BlueprintVisibility
from app.models.user import User, UserRole
from app.repositories import applications as applications_repository
from app.repositories import blueprints as blueprints_repository
from app.services.exceptions import (
    AlreadyAppliedError,
    AlreadySavedError,
    ApplicationAccessDeniedError,
    ApplicationNotFoundError,
    ApplicationPersistenceError,
    BlueprintNotFoundError,
    DeveloperProfileRequiredError,
    SavedBlueprintNotFoundError,
)


def _require_developer_profile(user: User) -> UUID:
    if user.role != UserRole.DEVELOPER or user.developer_profile is None:
        raise DeveloperProfileRequiredError("Only developers with a developer profile can do this.")
    return user.developer_profile.user_id


def _get_public_blueprint(db: Session, blueprint_id: UUID) -> Blueprint:
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    if blueprint is None or blueprint.visibility != BlueprintVisibility.PUBLIC:
        raise BlueprintNotFoundError("Blueprint not found.")
    return blueprint


def list_applications(
    db: Session, current_user: User, *, limit: int, offset: int
) -> tuple[list[Application], int]:
    developer_id = _require_developer_profile(current_user)
    return applications_repository.list_applications_for_developer(
        db, developer_id, limit=limit, offset=offset
    )


def create_application(
    db: Session, current_user: User, blueprint_id: UUID, *, role: str | None = None
) -> Application:
    developer_id = _require_developer_profile(current_user)

    _get_public_blueprint(db, blueprint_id)

    existing = applications_repository.get_application_by_developer_and_blueprint(
        db, developer_id, blueprint_id
    )
    if existing is not None:
        if existing.status == "withdrawn":
            try:
                application = applications_repository.reactivate_application(db, existing, role)
                db.commit()
                db.refresh(application)
            except SQLAlchemyError as exc:
                db.rollback()
                raise ApplicationPersistenceError("Application could not be created.") from exc
            return application
        raise AlreadyAppliedError("You have already applied to this blueprint.")

    try:
        application = applications_repository.create_application(
            db, developer_id, blueprint_id, role
        )
        db.commit()
        db.refresh(application)
    except IntegrityError as exc:
        db.rollback()
        raise AlreadyAppliedError("You have already applied to this blueprint.") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise ApplicationPersistenceError("Application could not be created.") from exc

    return application


def update_application(
    db: Session, application_id: UUID, current_user: User, connection_id: UUID | None
) -> Application:
    developer_id = _require_developer_profile(current_user)
    application = applications_repository.get_application_by_id(db, application_id)
    if application is None:
        raise ApplicationNotFoundError("Application not found.")
    if application.developer_id != developer_id:
        raise ApplicationAccessDeniedError("You do not have access to this application.")

    try:
        application.connection_id = connection_id
        db.commit()
        db.refresh(application)
    except SQLAlchemyError as exc:
        db.rollback()
        raise ApplicationPersistenceError("Application could not be updated.") from exc

    return application


def delete_application(db: Session, application_id: UUID, current_user: User) -> None:
    developer_id = _require_developer_profile(current_user)
    application = applications_repository.get_application_by_id(db, application_id)
    if application is None:
        raise ApplicationNotFoundError("Application not found.")
    if application.developer_id != developer_id:
        raise ApplicationAccessDeniedError("You do not have access to this application.")

    try:
        applications_repository.withdraw_application(db, application)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ApplicationPersistenceError("Application could not be deleted.") from exc


def save_blueprint(db: Session, current_user: User, blueprint_id: UUID) -> SavedBlueprint:
    developer_id = _require_developer_profile(current_user)

    _get_public_blueprint(db, blueprint_id)

    existing = applications_repository.get_saved_blueprint(db, developer_id, blueprint_id)
    if existing is not None:
        raise AlreadySavedError("You have already saved this blueprint.")

    try:
        saved = applications_repository.create_saved_blueprint(db, developer_id, blueprint_id)
        db.commit()
        db.refresh(saved)
    except IntegrityError as exc:
        db.rollback()
        raise AlreadySavedError("You have already saved this blueprint.") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise ApplicationPersistenceError("Blueprint could not be saved.") from exc

    return saved


def unsave_blueprint(db: Session, current_user: User, blueprint_id: UUID) -> None:
    developer_id = _require_developer_profile(current_user)
    saved = applications_repository.get_saved_blueprint(db, developer_id, blueprint_id)
    if saved is None:
        raise SavedBlueprintNotFoundError("This blueprint is not in your saved list.")

    try:
        applications_repository.delete_saved_blueprint(db, saved)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ApplicationPersistenceError("Saved blueprint could not be removed.") from exc


def list_saved_blueprints(
    db: Session, current_user: User, *, limit: int, offset: int
) -> tuple[list[SavedBlueprint], int]:
    developer_id = _require_developer_profile(current_user)
    return applications_repository.list_saved_blueprints_for_developer(
        db, developer_id, limit=limit, offset=offset
    )
