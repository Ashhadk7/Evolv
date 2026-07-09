from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.skills import (
    SkillCreate,
    SkillResponse,
    SkillUpdate,
)
from app.services import skills_service
from app.services.exceptions import NotFoundError, ConflictError

router = APIRouter()


@router.get("", response_model=list[SkillResponse])
def list_skills(
    db: DbSession,
    _: CurrentUser,
) -> list[SkillResponse]:
    items = skills_service.list_skills(db)
    return [SkillResponse.model_validate(s) for s in items]


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    payload: SkillCreate,
    db: DbSession,
    _: CurrentUser,
) -> SkillResponse:
    try:
        skill = skills_service.create_skill(db, payload)
        db.commit()
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return SkillResponse.model_validate(skill)


@router.patch("/{skill_id}", response_model=SkillResponse)
def update_skill(
    skill_id: int,
    payload: SkillUpdate,
    db: DbSession,
    _: CurrentUser,
) -> SkillResponse:
    try:
        skill = skills_service.update_skill(db, skill_id, payload)
        db.commit()
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return SkillResponse.model_validate(skill)


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    skill_id: int,
    db: DbSession,
    _: CurrentUser,
) -> None:
    try:
        skills_service.delete_skill(db, skill_id)
        db.commit()
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
