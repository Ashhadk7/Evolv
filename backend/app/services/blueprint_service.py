from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.blueprint import Blueprint, VersionState
from app.models.user import User, UserRole
from app.repositories import blueprints as blueprints_repository
from app.schemas.blueprints import BlueprintCreate, BlueprintUpdate, BlueprintVersionCreate
from app.services.exceptions import (
    BlueprintAccessDeniedError,
    BlueprintNotFoundError,
    BlueprintPersistenceError,
    FounderProfileRequiredError,
)


def _require_founder_profile(user: User) -> UUID:
    if user.role != UserRole.FOUNDER or user.founder_profile is None:
        raise FounderProfileRequiredError(
            "Only founders with a founder profile can own blueprints."
        )
    return user.founder_profile.user_id


def _is_owner(user: User, blueprint: Blueprint) -> bool:
    return user.founder_profile is not None and blueprint.founder_id == user.founder_profile.user_id


def list_blueprints(
    db: Session, current_user: User, *, limit: int, offset: int
) -> tuple[list[Blueprint], int]:
    founder_id = _require_founder_profile(current_user)
    return blueprints_repository.list_blueprints_for_founder(
        db, founder_id, limit=limit, offset=offset
    )


def get_blueprint(
    db: Session, blueprint_id: UUID, current_user: User, *, require_ownership: bool = True
) -> Blueprint:
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_id)
    if blueprint is None:
        raise BlueprintNotFoundError("Blueprint not found.")

    if _is_owner(current_user, blueprint):
        return blueprint

    if not require_ownership and blueprint.visibility.value == "public":
        return blueprint

    raise BlueprintAccessDeniedError("You do not have access to this blueprint.")


def create_blueprint(db: Session, current_user: User, payload: BlueprintCreate) -> Blueprint:
    founder_id = _require_founder_profile(current_user)
    try:
        blueprint = blueprints_repository.create_blueprint(db, founder_id, payload.visibility)
        blueprints_repository.create_version(
            db, blueprint.id, VersionState.CURRENT, payload.initial_version
        )
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise BlueprintPersistenceError("Blueprint could not be created.") from exc

    created = blueprints_repository.get_blueprint_by_id(db, blueprint.id)
    if created is None:
        raise BlueprintPersistenceError("Blueprint could not be loaded.")
    return created


def update_visibility(
    db: Session, blueprint_id: UUID, current_user: User, payload: BlueprintUpdate
) -> Blueprint:
    blueprint = get_blueprint(db, blueprint_id, current_user, require_ownership=True)

    try:
        blueprint.visibility = payload.visibility
        db.commit()
        db.refresh(blueprint)
    except SQLAlchemyError as exc:
        db.rollback()
        raise BlueprintPersistenceError("Blueprint could not be updated.") from exc

    return blueprint

def delete_blueprint(db: Session, blueprint_id: UUID, current_user: User) -> None:
    blueprint = get_blueprint(db, blueprint_id, current_user, require_ownership=True)

    try:
        blueprints_repository.delete_blueprint(db, blueprint)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise BlueprintPersistenceError("Blueprint could not be deleted.") from exc

def get_blueprint_dict(db: Session, blueprint_id: UUID, current_user: User) -> dict | None:
    blueprint = get_blueprint(db, blueprint_id, current_user, require_ownership=False)
    if not blueprint or not blueprint.current_version:
        return None
    
    version = blueprint.current_version
    cost_data = {}
    if version.content_json and "agents" in version.content_json:
        ts_agent = version.content_json["agents"].get("techStack") or {}
        cost_data = {
            "timeline": ts_agent.get("timeline") or "14 weeks",
            "team": f"{len(ts_agent.get('roles', []))} roles" if ts_agent.get("roles") else "4 members",
        }
        
    return {
        "id": str(blueprint.id),
        "name": version.name,
        "industry": version.industry,
        "idea": version.idea_desc,
        "differentiator": version.differentiator,
        "viability": version.viability,
        "marketPotential": version.market_potential,
        "contentJson": version.content_json or {},
        "cost": cost_data,
        "views": 0,
        "developerApplications": 7,
        "profileSaves": 4,
    }

