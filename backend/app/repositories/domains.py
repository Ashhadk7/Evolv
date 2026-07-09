from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.skill import Domain, FounderDomain


def get_domain_by_id(db: Session, domain_id: int) -> Domain | None:
    return db.get(Domain, domain_id)


def get_domain_by_name(db: Session, name: str) -> Domain | None:
    normalized = name.strip().lower()
    return db.scalar(select(Domain).where(func.lower(Domain.name) == normalized))


def list_domains(db: Session) -> list[Domain]:
    return list(db.scalars(select(Domain).order_by(Domain.name)).all())


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


def list_founder_domains(db: Session, founder_id: UUID) -> list[FounderDomain]:
    return list(db.scalars(select(FounderDomain).where(FounderDomain.founder_id == founder_id)).all())


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
