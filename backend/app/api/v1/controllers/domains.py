from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.skills import (
    DomainCreate,
    DomainResponse,
    DomainUpdate,
)
from app.services import skills_service
from app.services.exceptions import NotFoundError, ConflictError

router = APIRouter()


@router.get("", response_model=list[DomainResponse])
def list_domains(
    db: DbSession,
    _: CurrentUser,
) -> list[DomainResponse]:
    items = skills_service.list_domains(db)
    return [DomainResponse.model_validate(d) for d in items]


@router.post("", response_model=DomainResponse, status_code=status.HTTP_201_CREATED)
def create_domain(
    payload: DomainCreate,
    db: DbSession,
    _: CurrentUser,
) -> DomainResponse:
    try:
        domain = skills_service.create_domain(db, payload)
        db.commit()
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return DomainResponse.model_validate(domain)


@router.patch("/{domain_id}", response_model=DomainResponse)
def update_domain(
    domain_id: int,
    payload: DomainUpdate,
    db: DbSession,
    _: CurrentUser,
) -> DomainResponse:
    try:
        domain = skills_service.update_domain(db, domain_id, payload)
        db.commit()
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return DomainResponse.model_validate(domain)


@router.delete("/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_domain(
    domain_id: int,
    db: DbSession,
    _: CurrentUser,
) -> None:
    try:
        skills_service.delete_domain(db, domain_id)
        db.commit()
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
