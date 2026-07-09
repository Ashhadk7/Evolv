from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Certification(Base):
    __tablename__ = "developer_certifications"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    issuer: Mapped[str] = mapped_column(String, nullable=False)
    issue_date: Mapped[str | None] = mapped_column(String, nullable=True)
    credential_id: Mapped[str | None] = mapped_column(String, nullable=True)
    credential_url: Mapped[str | None] = mapped_column(String, nullable=True)

    user: Mapped[User] = relationship(back_populates="certifications")
