from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.skills import (
    TagCreate,
    TagResponse,
    TagUpdate,
)
from app.services import skills_service
from app.services.exceptions import NotFoundError, ConflictError

router = APIRouter()


@router.get("", response_model=list[TagResponse])
def list_tags(
    db: DbSession,
    _: CurrentUser,
) -> list[TagResponse]:
    items = skills_service.list_tags(db)
    return [TagResponse.model_validate(t) for t in items]


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    payload: TagCreate,
    db: DbSession,
    _: CurrentUser,
) -> TagResponse:
    try:
        tag = skills_service.create_tag(db, payload)
        db.commit()
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return TagResponse.model_validate(tag)


@router.patch("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: int,
    payload: TagUpdate,
    db: DbSession,
    _: CurrentUser,
) -> TagResponse:
    try:
        tag = skills_service.update_tag(db, tag_id, payload)
        db.commit()
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return TagResponse.model_validate(tag)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: DbSession,
    _: CurrentUser,
) -> None:
    try:
        skills_service.delete_tag(db, tag_id)
        db.commit()
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
