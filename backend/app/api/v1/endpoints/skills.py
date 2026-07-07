from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.skills import (
    DeveloperTagCreate,
    DeveloperTagResponse,
    DomainCreate,
    DomainListResponse,
    DomainResponse,
    DomainUpdate,
    FounderDomainCreate,
    FounderDomainResponse,
    SkillCreate,
    SkillListResponse,
    SkillResponse,
    SkillUpdate,
    TagCreate,
    TagListResponse,
    TagResponse,
    TagUpdate,
    UserSkillCreate,
    UserSkillResponse,
)
from app.services import skills_service
from app.services.exceptions import SkillConflictError, SkillNotFoundError

router = APIRouter()


# ══════════════════════════════════════════════════════════════════════════════
# Skills — global catalogue CRUD
# ══════════════════════════════════════════════════════════════════════════════

@router.get("", response_model=SkillListResponse, summary="List all skills")
def list_skills(
    db: DbSession,
    current_user: CurrentUser,
    search: str | None = Query(default=None, min_length=1, max_length=80),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> SkillListResponse:
    del current_user
    items, total = skills_service.list_skills(db, search=search, limit=limit, offset=offset)
    return SkillListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=[SkillResponse.model_validate(s) for s in items],
    )


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED, summary="Create a skill")
def create_skill(
    payload: SkillCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> SkillResponse:
    del current_user
    try:
        skill = skills_service.create_skill(db, payload)
        db.commit()
    except SkillConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return SkillResponse.model_validate(skill)


@router.patch("/{skill_id}", response_model=SkillResponse, summary="Rename a skill")
def update_skill(
    skill_id: int,
    payload: SkillUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> SkillResponse:
    del current_user
    try:
        skill = skills_service.update_skill(db, skill_id, payload)
        db.commit()
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except SkillConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return SkillResponse.model_validate(skill)


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a skill")
def delete_skill(
    skill_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    del current_user
    try:
        skills_service.delete_skill(db, skill_id)
        db.commit()
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


# ── Current user's skills ──────────────────────────────────────────────────────

@router.get("/me/skills", response_model=list[UserSkillResponse], summary="Get my skills")
def list_my_skills(db: DbSession, current_user: CurrentUser) -> list[UserSkillResponse]:
    items = skills_service.list_user_skills(db, current_user.id)
    return [UserSkillResponse.model_validate(us) for us in items]


@router.post(
    "/me/skills",
    response_model=UserSkillResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a skill to my profile",
)
def add_my_skill(
    payload: UserSkillCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> UserSkillResponse:
    try:
        user_skill = skills_service.add_user_skill(db, current_user.id, payload)
        db.commit()
        db.refresh(user_skill)
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except SkillConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return UserSkillResponse.model_validate(user_skill)


@router.delete(
    "/me/skills/{skill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a skill from my profile",
)
def remove_my_skill(
    skill_id: int,
    db: DbSession,
    current_user: CurrentUser,
    kind: str = Query(..., description="Skill | Tech stack | Framework | Tool"),
) -> None:
    try:
        skills_service.remove_user_skill(db, current_user.id, skill_id, kind)
        db.commit()
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


# ══════════════════════════════════════════════════════════════════════════════
# Tags — global catalogue CRUD
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/tags", response_model=TagListResponse, summary="List all tags")
def list_tags(
    db: DbSession,
    current_user: CurrentUser,
    search: str | None = Query(default=None, min_length=1, max_length=60),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> TagListResponse:
    del current_user
    items, total = skills_service.list_tags(db, search=search, limit=limit, offset=offset)
    return TagListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=[TagResponse.model_validate(t) for t in items],
    )


@router.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED, summary="Create a tag")
def create_tag(
    payload: TagCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> TagResponse:
    del current_user
    try:
        tag = skills_service.create_tag(db, payload)
        db.commit()
    except SkillConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return TagResponse.model_validate(tag)


@router.patch("/tags/{tag_id}", response_model=TagResponse, summary="Rename a tag")
def update_tag(
    tag_id: int,
    payload: TagUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> TagResponse:
    del current_user
    try:
        tag = skills_service.update_tag(db, tag_id, payload)
        db.commit()
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except SkillConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return TagResponse.model_validate(tag)


@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a tag")
def delete_tag(
    tag_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    del current_user
    try:
        skills_service.delete_tag(db, tag_id)
        db.commit()
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


# ── Developer's tags ───────────────────────────────────────────────────────────

@router.get("/me/tags", response_model=list[DeveloperTagResponse], summary="Get my tags")
def list_my_tags(db: DbSession, current_user: CurrentUser) -> list[DeveloperTagResponse]:
    items = skills_service.list_developer_tags(db, current_user.id)
    return [DeveloperTagResponse.model_validate(dt) for dt in items]


@router.post(
    "/me/tags",
    response_model=DeveloperTagResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a tag to my profile",
)
def add_my_tag(
    payload: DeveloperTagCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> DeveloperTagResponse:
    try:
        dev_tag = skills_service.add_developer_tag(db, current_user.id, payload)
        db.commit()
        db.refresh(dev_tag)
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except SkillConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return DeveloperTagResponse.model_validate(dev_tag)


@router.delete(
    "/me/tags/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a tag from my profile",
)
def remove_my_tag(
    tag_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    try:
        skills_service.remove_developer_tag(db, current_user.id, tag_id)
        db.commit()
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


# ══════════════════════════════════════════════════════════════════════════════
# Domains — global catalogue CRUD
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/domains", response_model=DomainListResponse, summary="List all domains")
def list_domains(
    db: DbSession,
    current_user: CurrentUser,
    search: str | None = Query(default=None, min_length=1, max_length=60),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> DomainListResponse:
    del current_user
    items, total = skills_service.list_domains(db, search=search, limit=limit, offset=offset)
    return DomainListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=[DomainResponse.model_validate(d) for d in items],
    )


@router.post("/domains", response_model=DomainResponse, status_code=status.HTTP_201_CREATED, summary="Create a domain")
def create_domain(
    payload: DomainCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> DomainResponse:
    del current_user
    try:
        domain = skills_service.create_domain(db, payload)
        db.commit()
    except SkillConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return DomainResponse.model_validate(domain)


@router.patch("/domains/{domain_id}", response_model=DomainResponse, summary="Rename a domain")
def update_domain(
    domain_id: int,
    payload: DomainUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> DomainResponse:
    del current_user
    try:
        domain = skills_service.update_domain(db, domain_id, payload)
        db.commit()
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except SkillConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return DomainResponse.model_validate(domain)


@router.delete("/domains/{domain_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a domain")
def delete_domain(
    domain_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    del current_user
    try:
        skills_service.delete_domain(db, domain_id)
        db.commit()
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


# ── Founder's domains ──────────────────────────────────────────────────────────

@router.get("/me/domains", response_model=list[FounderDomainResponse], summary="Get my domain interests")
def list_my_domains(db: DbSession, current_user: CurrentUser) -> list[FounderDomainResponse]:
    items = skills_service.list_founder_domains(db, current_user.id)
    return [FounderDomainResponse.model_validate(fd) for fd in items]


@router.post(
    "/me/domains",
    response_model=FounderDomainResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a domain to my profile",
)
def add_my_domain(
    payload: FounderDomainCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> FounderDomainResponse:
    try:
        fd = skills_service.add_founder_domain(db, current_user.id, payload)
        db.commit()
        db.refresh(fd)
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except SkillConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return FounderDomainResponse.model_validate(fd)


@router.delete(
    "/me/domains/{domain_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a domain from my profile",
)
def remove_my_domain(
    domain_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    try:
        skills_service.remove_founder_domain(db, current_user.id, domain_id)
        db.commit()
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
