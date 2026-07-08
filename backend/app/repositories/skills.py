from __future__ import annotations

import uuid
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.skill import Skill, UserSkill, SkillKind, SkillExperience


def get_skill_by_id(db: Session, skill_id: int) -> Skill | None:
    return db.get(Skill, skill_id)


def get_skill_by_name(db: Session, name: str) -> Skill | None:
    normalized = name.strip().lower()
    return db.scalar(select(Skill).where(func.lower(Skill.name) == normalized))


def list_skills(db: Session) -> list[Skill]:
    return list(db.scalars(select(Skill).order_by(Skill.name)).all())


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


def list_user_skills(db: Session, user_id: UUID) -> list[UserSkill]:
    return list(db.scalars(select(UserSkill).where(UserSkill.user_id == user_id)).all())


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
    user_skill = UserSkill(
        id=uuid.uuid4(),
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
