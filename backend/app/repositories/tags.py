from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.skill import Tag, DeveloperTag


def get_tag_by_id(db: Session, tag_id: int) -> Tag | None:
    return db.get(Tag, tag_id)


def get_tag_by_name(db: Session, name: str) -> Tag | None:
    normalized = name.strip().lower()
    return db.scalar(select(Tag).where(func.lower(Tag.name) == normalized))


def list_tags(db: Session) -> list[Tag]:
    return list(db.scalars(select(Tag).order_by(Tag.name)).all())


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


def list_developer_tags(db: Session, developer_id: UUID) -> list[DeveloperTag]:
    return list(db.scalars(select(DeveloperTag).where(DeveloperTag.developer_id == developer_id)).all())


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
