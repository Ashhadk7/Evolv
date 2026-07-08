from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.blueprint import Blueprint, BlueprintVersion, VersionState
from app.models.user import User, UserRole
from app.repositories import blueprints as blueprints_repository
from app.schemas.blueprints import (
    BlueprintCreate,
    BlueprintUpdate,
    BlueprintVersionCreate,
)
from app.services.exceptions import (
    BlueprintAccessDeniedError,
    BlueprintNotFoundError,
    BlueprintPersistenceError,
    BlueprintVersionNotFoundError,
    FounderProfileRequiredError,
)


def _require_founder_profile(user: User) -> UUID:
    """Return the founder_profiles.user_id that blueprints are owned by.

    Raises FounderProfileRequiredError if the current user cannot own blueprints.
    """
    if user.role != UserRole.FOUNDER or user.founder_profile is None:
        raise FounderProfileRequiredError(
            "Only founders with a founder profile can own blueprints."
        )
    return user.founder_profile.user_id


def _is_owner(user: User, blueprint: Blueprint) -> bool:
    return user.founder_profile is not None and blueprint.founder_id == user.founder_profile.user_id


class BlueprintService:
    def list_blueprints(
        self,
        db: Session,
        current_user: User,
        *,
        limit: int,
        offset: int,
    ) -> tuple[list[Blueprint], int]:
        founder_id = _require_founder_profile(current_user)
        return blueprints_repository.list_blueprints_for_founder(
            db, founder_id, limit=limit, offset=offset
        )

    def get_blueprint(
        self,
        db: Session,
        blueprint_id: UUID,
        current_user: User,
        *,
        require_ownership: bool = True,
    ) -> Blueprint:
        blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
        if blueprint is None:
            raise BlueprintNotFoundError("Blueprint not found.")

        if _is_owner(current_user, blueprint):
            return blueprint

        if not require_ownership and blueprint.visibility.value == "public":
            return blueprint

        raise BlueprintAccessDeniedError("You do not have access to this blueprint.")

    def create_blueprint(
        self,
        db: Session,
        current_user: User,
        payload: BlueprintCreate,
    ) -> Blueprint:
        founder_id = _require_founder_profile(current_user)
        try:
            blueprint = blueprints_repository.create_blueprint(db, founder_id, payload.visibility)
            # The very first version of a brand-new blueprint is published
            # immediately as `current` — there is nothing to promote yet.
            blueprints_repository.create_version(
                db, blueprint.id, VersionState.CURRENT, payload.initial_version
            )
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            raise BlueprintPersistenceError("Blueprint could not be created.") from exc

        return blueprints_repository.get_blueprint_by_id(db, blueprint.id)  # type: ignore[return-value]

    def update_visibility(
        self,
        db: Session,
        blueprint_id: UUID,
        current_user: User,
        payload: BlueprintUpdate,
    ) -> Blueprint:
        blueprint = self.get_blueprint(db, blueprint_id, current_user, require_ownership=True)

        try:
            blueprint.visibility = payload.visibility
            db.commit()
            db.refresh(blueprint)
        except SQLAlchemyError as exc:
            db.rollback()
            raise BlueprintPersistenceError("Blueprint could not be updated.") from exc

        return blueprint

    def delete_blueprint(self, db: Session, blueprint_id: UUID, current_user: User) -> None:
        blueprint = self.get_blueprint(db, blueprint_id, current_user, require_ownership=True)

        try:
            blueprints_repository.delete_blueprint(db, blueprint)
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            raise BlueprintPersistenceError("Blueprint could not be deleted.") from exc

    def submit_pending_version(
        self,
        db: Session,
        blueprint_id: UUID,
        current_user: User,
        payload: BlueprintVersionCreate,
    ) -> BlueprintVersion:
        """Create the draft (`pending`) version, or overwrite it if one already exists.

        At most one `pending` row can exist per blueprint (enforced by a DB
        unique constraint), so this operation is an upsert rather than an insert.
        """
        blueprint = self.get_blueprint(db, blueprint_id, current_user, require_ownership=True)

        try:
            existing_pending = blueprints_repository.get_version_by_state(
                db, blueprint.id, VersionState.PENDING
            )
            if existing_pending is not None:
                version = blueprints_repository.overwrite_version_content(existing_pending, payload)
            else:
                version = blueprints_repository.create_version(
                    db, blueprint.id, VersionState.PENDING, payload
                )
            db.commit()
            db.refresh(version)
        except SQLAlchemyError as exc:
            db.rollback()
            raise BlueprintPersistenceError("Blueprint version could not be saved.") from exc

        return version

    def list_versions(
        self, db: Session, blueprint_id: UUID, current_user: User
    ) -> list[BlueprintVersion]:
        blueprint = self.get_blueprint(db, blueprint_id, current_user, require_ownership=True)
        return sorted(blueprint.versions, key=lambda version: version.state.value)

    def get_latest_version(
        self, db: Session, blueprint_id: UUID, current_user: User
    ) -> BlueprintVersion:
        blueprint = self.get_blueprint(
            db, blueprint_id, current_user, require_ownership=False
        )
        current_version = blueprints_repository.get_version_by_state(
            db, blueprint.id, VersionState.CURRENT
        )
        if current_version is None:
            raise BlueprintVersionNotFoundError("This blueprint has no published version yet.")
        return current_version

    def promote_pending_version(
        self, db: Session, blueprint_id: UUID, current_user: User
    ) -> BlueprintVersion:
        blueprint = self.get_blueprint(db, blueprint_id, current_user, require_ownership=True)

        pending_version = blueprints_repository.get_version_by_state(
            db, blueprint.id, VersionState.PENDING
        )
        if pending_version is None:
            raise BlueprintVersionNotFoundError("There is no pending version to promote.")

        try:
            current_version = blueprints_repository.get_version_by_state(
                db, blueprint.id, VersionState.CURRENT
            )
            if current_version is not None:
                blueprints_repository.delete_version(db, current_version)
                db.flush()

            pending_version.state = VersionState.CURRENT
            db.commit()
            db.refresh(pending_version)
        except SQLAlchemyError as exc:
            db.rollback()
            raise BlueprintPersistenceError("Pending version could not be promoted.") from exc

        return pending_version
