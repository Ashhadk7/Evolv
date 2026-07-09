from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import CurrentDeveloper, CurrentFounder, DbSession
from app.schemas.skills import (
    DeveloperTagCreate,
    DeveloperTagResponse,
    FounderDomainCreate,
    FounderDomainResponse,
    UserSkillCreate,
    UserSkillResponse,
)
from app.services import skills_service
from app.services.exceptions import NotFoundError, ConflictError

router = APIRouter()


@router.get("/skills", response_model=list[UserSkillResponse])
def list_my_skills(db: DbSession, current_user: CurrentDeveloper) -> list[UserSkillResponse]:
    items = skills_service.list_user_skills(db, current_user.id)
    return [UserSkillResponse.model_validate(us) for us in items]


@router.post("/skills", response_model=UserSkillResponse, status_code=status.HTTP_201_CREATED)
def add_my_skill(
    payload: UserSkillCreate,
    db: DbSession,
    current_user: CurrentDeveloper,
) -> UserSkillResponse:
    try:
        user_skill = skills_service.add_user_skill(db, current_user.id, payload)
        db.commit()
        db.refresh(user_skill)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return UserSkillResponse.model_validate(user_skill)


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_skill(
    skill_id: int,
    db: DbSession,
    current_user: CurrentDeveloper,
    kind: str = Query(...),
) -> None:
    try:
        skills_service.remove_user_skill(db, current_user.id, skill_id, kind)
        db.commit()
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/tags", response_model=list[DeveloperTagResponse])
def list_my_tags(db: DbSession, current_user: CurrentDeveloper) -> list[DeveloperTagResponse]:
    items = skills_service.list_developer_tags(db, current_user.id)
    return [DeveloperTagResponse.model_validate(dt) for dt in items]


@router.post("/tags", response_model=DeveloperTagResponse, status_code=status.HTTP_201_CREATED)
def add_my_tag(
    payload: DeveloperTagCreate,
    db: DbSession,
    current_user: CurrentDeveloper,
) -> DeveloperTagResponse:
    try:
        dev_tag = skills_service.add_developer_tag(db, current_user.id, payload)
        db.commit()
        db.refresh(dev_tag)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return DeveloperTagResponse.model_validate(dev_tag)


@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_tag(
    tag_id: int,
    db: DbSession,
    current_user: CurrentDeveloper,
) -> None:
    try:
        skills_service.remove_developer_tag(db, current_user.id, tag_id)
        db.commit()
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/domains", response_model=list[FounderDomainResponse])
def list_my_domains(db: DbSession, current_user: CurrentFounder) -> list[FounderDomainResponse]:
    items = skills_service.list_founder_domains(db, current_user.id)
    return [FounderDomainResponse.model_validate(fd) for fd in items]


@router.post("/domains", response_model=FounderDomainResponse, status_code=status.HTTP_201_CREATED)
def add_my_domain(
    payload: FounderDomainCreate,
    db: DbSession,
    current_user: CurrentFounder,
) -> FounderDomainResponse:
    try:
        fd = skills_service.add_founder_domain(db, current_user.id, payload)
        db.commit()
        db.refresh(fd)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return FounderDomainResponse.model_validate(fd)


@router.delete("/domains/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_domain(
    domain_id: int,
    db: DbSession,
    current_user: CurrentFounder,
) -> None:
    try:
        skills_service.remove_founder_domain(db, current_user.id, domain_id)
        db.commit()
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
