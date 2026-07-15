from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.blueprint import BlueprintVersion, VersionState
from app.models.user import User
from app.repositories import blueprints as blueprints_repository
from app.services import blueprint_service
from app.services.exceptions import (
    BlueprintAgentInputError,
    BlueprintGenerationError,
    BlueprintPersistenceError,
    BlueprintVersionNotFoundError,
)
from app.services.generation.client import AgentClientError
from app.services.generation.agents.positioning import PositioningOutput, run_positioning

CONTENT_SCHEMA_VERSION = 1


async def generate_positioning_for_blueprint(
    db: Session,
    blueprint_id: UUID,
    current_user: User,
) -> tuple[BlueprintVersion, PositioningOutput]:
    blueprint = blueprint_service.get_blueprint(
        db, blueprint_id, current_user, require_ownership=True
    )
    source_version = blueprint.pending_version or blueprint.current_version
    if source_version is None:
        raise BlueprintVersionNotFoundError("This blueprint has no version to position.")

    try:
        positioning = await run_positioning(source_version.idea_desc, source_version.industry)
    except ValueError as exc:
        raise BlueprintAgentInputError(str(exc)) from exc
    except AgentClientError as exc:
        raise BlueprintGenerationError(
            "Positioning agent could not generate output. Check GROQ_API_KEY and model availability."
        ) from exc

    try:
        target_version = blueprint.pending_version
        if target_version is None:
            target_version = blueprints_repository.clone_version(
                db, source_version, VersionState.PENDING
            )

        target_version.name = positioning.name
        target_version.differentiator = positioning.differentiator
        target_version.content_json = merge_positioning_content(
            target_version.content_json or source_version.content_json,
            positioning,
        )
        db.commit()
        db.refresh(target_version)
    except SQLAlchemyError as exc:
        db.rollback()
        raise BlueprintPersistenceError("Positioning output could not be saved.") from exc

    return target_version, positioning


def merge_positioning_content(
    existing_content: dict[str, Any] | None,
    positioning: PositioningOutput,
) -> dict[str, Any]:
    content: dict[str, Any] = dict(existing_content or {})
    agents = content.get("agents")
    if not isinstance(agents, dict):
        agents = {}

    agents["positioning"] = positioning.model_dump(by_alias=True)
    content["schemaVersion"] = CONTENT_SCHEMA_VERSION
    content["agents"] = agents
    content["updatedAt"] = datetime.now(UTC).isoformat()
    return content
