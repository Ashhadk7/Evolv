from __future__ import annotations

from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.certification import Certification
from app.schemas.certifications import CertificationCreate


def list_certifications_for_user(db: Session, user_id: UUID) -> list[Certification]:
    statement = select(Certification).where(Certification.user_id == user_id).order_by(Certification.id)
    return list(db.scalars(statement).all())


def replace_certifications_for_user(
    db: Session,
    *,
    user_id: UUID,
    certifications: list[CertificationCreate],
) -> None:
    delete_certifications_for_user(db, user_id)
    db.add_all([Certification(user_id=user_id, **cert.model_dump()) for cert in certifications])


def delete_certifications_for_user(db: Session, user_id: UUID) -> None:
    db.execute(delete(Certification).where(Certification.user_id == user_id))
