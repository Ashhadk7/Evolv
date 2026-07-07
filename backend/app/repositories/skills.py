from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.skill import (
    Domain,
    DeveloperTag,
    FounderDomain,
    Skill,
    Tag,
    UserSkill,
    SkillKind,
    SkillExperience,
)


# ══════════════════════════════════════════════════════════════════════════════
# Skills
# ══════════════════════════════════════════════════════════════════════════════

def get_skill_by_id(db: Session, skill_id: int) -> Skill | None:
    return db.get(Skill, skill_id)


def get_skill_by_name(db: Session, name: str) -> Skill | None:
    normalized = name.strip().lower()
    return db.scalar(select(Skill).where(func.lower(Skill.name) == normalized))


def list_skills(
    db: Session,
    *,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Skill], int]:
    count_stmt = select(func.count()).select_from(Skill)
    list_stmt = select(Skill).order_by(Skill.name).offset(offset).limit(limit)

    if search:
        pattern = f"%{search.strip().lower()}%"
        count_stmt = count_stmt.where(func.lower(Skill.name).like(pattern))
        list_stmt = list_stmt.where(func.lower(Skill.name).like(pattern))

    total = db.scalar(count_stmt) or 0
    items = list(db.scalars(list_stmt).all())
    return items, total


def create_skill(db: Session, name: str) -> Skill:
    skill = Skill(name=name.strip())
    db.add(skill)
    db.flush()
    return skill


def update_skill(db: Session, skill: Skill, name: str) -> Skill:
    skill.name = name.strip()
    db.flush()
    return skill


def delete_skill(db: Session, skill: Skill) -> None:
    db.delete(skill)
    db.flush()


# ── User skills ────────────────────────────────────────────────────────────────

def list_user_skills(db: Session, user_id: UUID) -> list[UserSkill]:
    stmt = select(UserSkill).where(UserSkill.user_id == user_id)
    return list(db.scalars(stmt).all())


def get_user_skill(db: Session, user_id: UUID, skill_id: int, kind: str) -> UserSkill | None:
    return db.scalar(
        select(UserSkill).where(
            UserSkill.user_id == user_id,
            UserSkill.skill_id == skill_id,
            UserSkill.kind == kind,
        )
    )


def add_user_skill(
    db: Session,
    user_id: UUID,
    skill_id: int,
    kind: str,
    experience_level: str,
) -> UserSkill:
    import uuid as _uuid
    user_skill = UserSkill(
        id=_uuid.uuid4(),
        user_id=user_id,
        skill_id=skill_id,
        kind=SkillKind(kind),
        experience_level=SkillExperience(experience_level),
    )
    db.add(user_skill)
    db.flush()
    return user_skill


def remove_user_skill(db: Session, user_skill: UserSkill) -> None:
    db.delete(user_skill)
    db.flush()


# ══════════════════════════════════════════════════════════════════════════════
# Tags
# ══════════════════════════════════════════════════════════════════════════════

def get_tag_by_id(db: Session, tag_id: int) -> Tag | None:
    return db.get(Tag, tag_id)


def get_tag_by_name(db: Session, name: str) -> Tag | None:
    normalized = name.strip().lower()
    return db.scalar(select(Tag).where(func.lower(Tag.name) == normalized))


def list_tags(
    db: Session,
    *,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Tag], int]:
    count_stmt = select(func.count()).select_from(Tag)
    list_stmt = select(Tag).order_by(Tag.name).offset(offset).limit(limit)

    if search:
        pattern = f"%{search.strip().lower()}%"
        count_stmt = count_stmt.where(func.lower(Tag.name).like(pattern))
        list_stmt = list_stmt.where(func.lower(Tag.name).like(pattern))

    total = db.scalar(count_stmt) or 0
    items = list(db.scalars(list_stmt).all())
    return items, total


def create_tag(db: Session, name: str) -> Tag:
    tag = Tag(name=name.strip())
    db.add(tag)
    db.flush()
    return tag


def update_tag(db: Session, tag: Tag, name: str) -> Tag:
    tag.name = name.strip()
    db.flush()
    return tag


def delete_tag(db: Session, tag: Tag) -> None:
    db.delete(tag)
    db.flush()


# ── Developer tags ─────────────────────────────────────────────────────────────

def list_developer_tags(db: Session, developer_id: UUID) -> list[DeveloperTag]:
    stmt = select(DeveloperTag).where(DeveloperTag.developer_id == developer_id)
    return list(db.scalars(stmt).all())


def get_developer_tag(db: Session, developer_id: UUID, tag_id: int) -> DeveloperTag | None:
    return db.scalar(
        select(DeveloperTag).where(
            DeveloperTag.developer_id == developer_id,
            DeveloperTag.tag_id == tag_id,
        )
    )


def add_developer_tag(db: Session, developer_id: UUID, tag_id: int) -> DeveloperTag:
    dev_tag = DeveloperTag(developer_id=developer_id, tag_id=tag_id)
    db.add(dev_tag)
    db.flush()
    return dev_tag


def remove_developer_tag(db: Session, dev_tag: DeveloperTag) -> None:
    db.delete(dev_tag)
    db.flush()


# ══════════════════════════════════════════════════════════════════════════════
# Domains
# ══════════════════════════════════════════════════════════════════════════════

def get_domain_by_id(db: Session, domain_id: int) -> Domain | None:
    return db.get(Domain, domain_id)


def get_domain_by_name(db: Session, name: str) -> Domain | None:
    normalized = name.strip().lower()
    return db.scalar(select(Domain).where(func.lower(Domain.name) == normalized))


def list_domains(
    db: Session,
    *,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Domain], int]:
    count_stmt = select(func.count()).select_from(Domain)
    list_stmt = select(Domain).order_by(Domain.name).offset(offset).limit(limit)

    if search:
        pattern = f"%{search.strip().lower()}%"
        count_stmt = count_stmt.where(func.lower(Domain.name).like(pattern))
        list_stmt = list_stmt.where(func.lower(Domain.name).like(pattern))

    total = db.scalar(count_stmt) or 0
    items = list(db.scalars(list_stmt).all())
    return items, total


def create_domain(db: Session, name: str) -> Domain:
    domain = Domain(name=name.strip())
    db.add(domain)
    db.flush()
    return domain


def update_domain(db: Session, domain: Domain, name: str) -> Domain:
    domain.name = name.strip()
    db.flush()
    return domain


def delete_domain(db: Session, domain: Domain) -> None:
    db.delete(domain)
    db.flush()


# ── Founder domains ────────────────────────────────────────────────────────────

def list_founder_domains(db: Session, founder_id: UUID) -> list[FounderDomain]:
    stmt = select(FounderDomain).where(FounderDomain.founder_id == founder_id)
    return list(db.scalars(stmt).all())


def get_founder_domain(db: Session, founder_id: UUID, domain_id: int) -> FounderDomain | None:
    return db.scalar(
        select(FounderDomain).where(
            FounderDomain.founder_id == founder_id,
            FounderDomain.domain_id == domain_id,
        )
    )


def add_founder_domain(db: Session, founder_id: UUID, domain_id: int) -> FounderDomain:
    fd = FounderDomain(founder_id=founder_id, domain_id=domain_id)
    db.add(fd)
    db.flush()
    return fd


def remove_founder_domain(db: Session, founder_domain: FounderDomain) -> None:
    db.delete(founder_domain)
    db.flush()
