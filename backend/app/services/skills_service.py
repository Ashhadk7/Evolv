from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.skill import Domain, DeveloperTag, FounderDomain, Skill, Tag, UserSkill
from app.repositories import skills as skills_repo
from app.repositories import tags as tags_repo
from app.repositories import domains as domains_repo
from app.schemas.skills import (
    DomainCreate,
    DomainUpdate,
    DeveloperTagCreate,
    FounderDomainCreate,
    SkillCreate,
    SkillUpdate,
    TagCreate,
    TagUpdate,
    UserSkillCreate,
)
from app.services.exceptions import ConflictError, NotFoundError


def list_skills(db: Session) -> list[Skill]:
    return skills_repo.list_skills(db)


def create_skill(db: Session, payload: SkillCreate) -> Skill:
    if skills_repo.get_skill_by_name(db, payload.name):
        raise ConflictError(f"A skill named '{payload.name}' already exists.")
    return skills_repo.create_skill(db, payload.name)


def update_skill(db: Session, skill_id: int, payload: SkillUpdate) -> Skill:
    skill = skills_repo.get_skill_by_id(db, skill_id)
    if skill is None:
        raise NotFoundError(f"Skill {skill_id} not found.")
    duplicate = skills_repo.get_skill_by_name(db, payload.name)
    if duplicate and duplicate.id != skill_id:
        raise ConflictError(f"A skill named '{payload.name}' already exists.")
    return skills_repo.update_skill(db, skill, payload.name)


def delete_skill(db: Session, skill_id: int) -> None:
    skill = skills_repo.get_skill_by_id(db, skill_id)
    if skill is None:
        raise NotFoundError(f"Skill {skill_id} not found.")
    skills_repo.delete_skill(db, skill)


def list_user_skills(db: Session, user_id: UUID) -> list[UserSkill]:
    return skills_repo.list_user_skills(db, user_id)


def add_user_skill(db: Session, user_id: UUID, payload: UserSkillCreate) -> UserSkill:
    if skills_repo.get_skill_by_id(db, payload.skill_id) is None:
        raise NotFoundError(f"Skill {payload.skill_id} not found.")
    if skills_repo.get_user_skill(db, user_id, payload.skill_id, payload.kind):
        raise ConflictError("You have already added this skill with the same kind.")
    return skills_repo.add_user_skill(db, user_id, payload.skill_id, payload.kind, payload.experience_level)


def remove_user_skill(db: Session, user_id: UUID, skill_id: int, kind: str) -> None:
    user_skill = skills_repo.get_user_skill(db, user_id, skill_id, kind)
    if user_skill is None:
        raise NotFoundError("This skill is not on your profile.")
    skills_repo.remove_user_skill(db, user_skill)


def list_tags(db: Session) -> list[Tag]:
    return tags_repo.list_tags(db)


def create_tag(db: Session, payload: TagCreate) -> Tag:
    if tags_repo.get_tag_by_name(db, payload.name):
        raise ConflictError(f"A tag named '{payload.name}' already exists.")
    return tags_repo.create_tag(db, payload.name)


def update_tag(db: Session, tag_id: int, payload: TagUpdate) -> Tag:
    tag = tags_repo.get_tag_by_id(db, tag_id)
    if tag is None:
        raise NotFoundError(f"Tag {tag_id} not found.")
    duplicate = tags_repo.get_tag_by_name(db, payload.name)
    if duplicate and duplicate.id != tag_id:
        raise ConflictError(f"A tag named '{payload.name}' already exists.")
    return tags_repo.update_tag(db, tag, payload.name)


def delete_tag(db: Session, tag_id: int) -> None:
    tag = tags_repo.get_tag_by_id(db, tag_id)
    if tag is None:
        raise NotFoundError(f"Tag {tag_id} not found.")
    tags_repo.delete_tag(db, tag)


def list_developer_tags(db: Session, developer_id: UUID) -> list[DeveloperTag]:
    return tags_repo.list_developer_tags(db, developer_id)


def add_developer_tag(db: Session, developer_id: UUID, payload: DeveloperTagCreate) -> DeveloperTag:
    if tags_repo.get_tag_by_id(db, payload.tag_id) is None:
        raise NotFoundError(f"Tag {payload.tag_id} not found.")
    if tags_repo.get_developer_tag(db, developer_id, payload.tag_id):
        raise ConflictError("This tag is already on your profile.")
    return tags_repo.add_developer_tag(db, developer_id, payload.tag_id)


def remove_developer_tag(db: Session, developer_id: UUID, tag_id: int) -> None:
    dev_tag = tags_repo.get_developer_tag(db, developer_id, tag_id)
    if dev_tag is None:
        raise NotFoundError("This tag is not on your profile.")
    tags_repo.remove_developer_tag(db, dev_tag)


def list_domains(db: Session) -> list[Domain]:
    return domains_repo.list_domains(db)


def create_domain(db: Session, payload: DomainCreate) -> Domain:
    if domains_repo.get_domain_by_name(db, payload.name):
        raise ConflictError(f"A domain named '{payload.name}' already exists.")
    return domains_repo.create_domain(db, payload.name)


def update_domain(db: Session, domain_id: int, payload: DomainUpdate) -> Domain:
    domain = domains_repo.get_domain_by_id(db, domain_id)
    if domain is None:
        raise NotFoundError(f"Domain {domain_id} not found.")
    duplicate = domains_repo.get_domain_by_name(db, payload.name)
    if duplicate and duplicate.id != domain_id:
        raise ConflictError(f"A domain named '{payload.name}' already exists.")
    return domains_repo.update_domain(db, domain, payload.name)


def delete_domain(db: Session, domain_id: int) -> None:
    domain = domains_repo.get_domain_by_id(db, domain_id)
    if domain is None:
        raise NotFoundError(f"Domain {domain_id} not found.")
    domains_repo.delete_domain(db, domain)


def list_founder_domains(db: Session, founder_id: UUID) -> list[FounderDomain]:
    return domains_repo.list_founder_domains(db, founder_id)


def add_founder_domain(db: Session, founder_id: UUID, payload: FounderDomainCreate) -> FounderDomain:
    if domains_repo.get_domain_by_id(db, payload.domain_id) is None:
        raise NotFoundError(f"Domain {payload.domain_id} not found.")
    if domains_repo.get_founder_domain(db, founder_id, payload.domain_id):
        raise ConflictError("This domain is already on your profile.")
    return domains_repo.add_founder_domain(db, founder_id, payload.domain_id)


def remove_founder_domain(db: Session, founder_id: UUID, domain_id: int) -> None:
    fd = domains_repo.get_founder_domain(db, founder_id, domain_id)
    if fd is None:
        raise NotFoundError("This domain is not on your profile.")
    domains_repo.remove_founder_domain(db, fd)
