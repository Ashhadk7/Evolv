from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.blueprint import Blueprint, BlueprintVisibility, VersionState
from app.models.user import User, UserRole
from app.repositories import blueprints as blueprints_repository
from app.schemas.blueprints import (
    BlueprintContentUpdate,
    BlueprintCreate,
    BlueprintUpdate,
)
from app.services.exceptions import (
    BlueprintAccessDeniedError,
    BlueprintNotFoundError,
    BlueprintPersistenceError,
    BlueprintVersionNotFoundError,
    FounderProfileRequiredError,
)

_EDITABLE_LAYERS = frozenset(
    {"frontend", "backend", "aiProvider", "database", "vectorDb", "hosting"}
)


def sync_search_index(blueprint: Blueprint) -> None:
    """Keep the blueprint's vector in step with its published state.

    Imported lazily: the matching stack pulls in the vector-store client, which
    the majority of blueprint operations never need.
    """
    from app.services import discover_service, matching_service

    if blueprint.visibility == BlueprintVisibility.PUBLIC:
        matching_service.sync_blueprint_embedding(
            blueprint.id, discover_service.blueprint_embedding_text(blueprint)
        )
    else:
        matching_service.remove_blueprint_embedding(blueprint.id)


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

    sync_search_index(blueprint)
    return blueprint


def _reconcile_features(existing: object, edited_names: list[str]) -> list[dict[str, object] | str]:
    """Preserve rich feature specs (module, userStory, acceptanceCriteria, ...)
    across an editor save, which only round-trips names.

    The tech-stack/feature editor works on names only (BlueprintContentUpdate.features
    is list[str]), but generation may have produced structured Feature objects. A
    naive overwrite would silently replace that grounded spec with bare strings.
    Reconcile by name instead: keep the rich object for any name still present,
    and only add a plain string for names newly typed into the editor.
    """
    by_name: dict[str, object] = {}
    if isinstance(existing, list):
        for item in existing:
            name = item.get("name") if isinstance(item, dict) else item
            if isinstance(name, str) and name:
                by_name[name] = item

    reconciled = [by_name.get(name, name) for name in edited_names]
    return _prune_stale_references(reconciled, {name.strip().lower() for name in edited_names})


def _prune_stale_references(
    features: list[dict[str, object] | str], surviving: set[str]
) -> list[dict[str, object] | str]:
    """Drop dependencies pointing at features the editor removed or renamed.

    The editor round-trips names only, so a rename is indistinguishable from a
    delete plus an add and the reference cannot be followed. Leaving it would
    render "Depends on: Login" against a feature that no longer exists, which is
    worse for a developer reading the roadmap than losing the ordering hint.
    """
    pruned: list[dict[str, object] | str] = []
    for item in features:
        if not isinstance(item, dict):
            pruned.append(item)
            continue
        dependencies = item.get("dependencies")
        if isinstance(dependencies, list):
            item = {
                **item,
                "dependencies": [
                    dep
                    for dep in dependencies
                    if isinstance(dep, str) and dep.strip().lower() in surviving
                ],
            }
        pruned.append(item)
    return pruned


def update_content(
    db: Session, blueprint_id: UUID, current_user: User, payload: BlueprintContentUpdate
) -> Blueprint:
    """Persist user-edited content (features, tech-stack choices) onto the current
    version's content_json. Merges into fixed paths so the client can't overwrite
    the whole document — only the fields the editor exposes."""
    blueprint = get_blueprint(db, blueprint_id, current_user, require_ownership=True)
    version = blueprint.current_version
    if version is None:
        raise BlueprintVersionNotFoundError()

    try:
        content = dict(version.content_json or {})
        agents = dict(content.get("agents") or {})
        if payload.features is not None:
            product = dict(agents.get("product") or {})
            product["features"] = _reconcile_features(product.get("features"), payload.features)
            agents["product"] = product
        if payload.tech_stack is not None:
            tech_agent = dict(agents.get("techStack") or {})
            layers = dict(tech_agent.get("techStack") or {})
            for key, chosen in payload.tech_stack.items():
                if key not in _EDITABLE_LAYERS:
                    continue
                layers[key] = {**dict(layers.get(key) or {}), "chosen": chosen}
            tech_agent["techStack"] = layers
            agents["techStack"] = tech_agent
        content["agents"] = agents
        version.content_json = content
        db.commit()
        db.refresh(blueprint)
    except SQLAlchemyError as exc:
        db.rollback()
        raise BlueprintPersistenceError("Blueprint content could not be updated.") from exc

    sync_search_index(blueprint)
    return blueprint


def delete_blueprint(db: Session, blueprint_id: UUID, current_user: User) -> None:
    blueprint = get_blueprint(db, blueprint_id, current_user, require_ownership=True)

    try:
        blueprints_repository.delete_blueprint(db, blueprint)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise BlueprintPersistenceError("Blueprint could not be deleted.") from exc

    from app.services import matching_service

    matching_service.remove_blueprint_embedding(blueprint_id)


def get_blueprint_dict(db: Session, blueprint_id: UUID, current_user: User) -> dict | None:
    blueprint = get_blueprint(db, blueprint_id, current_user, require_ownership=False)
    if not blueprint or not blueprint.current_version:
        return None

    version = blueprint.current_version
    content_json = version.content_json or {}
    intake = content_json.get("intake", {}) if isinstance(content_json, dict) else {}

    return {
        "id": str(blueprint.id),
        "name": version.name,
        "industry": version.industry,
        "ideaDesc": version.idea_desc,
        "differentiator": version.differentiator,
        "aiRecommend": version.ai_recommend,
        "viability": version.viability,
        "marketPotential": version.market_potential,
        "developerDemand": version.developer_demand.value,
        "contentJson": content_json,
        "cost": {
            "timeline": intake.get("timeline", "") if isinstance(intake, dict) else "",
            "budget": intake.get("budget", "") if isinstance(intake, dict) else "",
        },
    }
