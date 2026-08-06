"""Add the project notification type and a deep-link payload column.

Revision ID: 20260805_0002
Revises: 20260805_0001

Downgrade drops the payload column but leaves the enum value in place:
PostgreSQL cannot remove a value from an enum type without rewriting it, and a
spare unused label is harmless.
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260805_0002"
down_revision: str | Sequence[str] | None = "20260805_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE notif_type ADD VALUE IF NOT EXISTS 'project'")
    op.add_column(
        "notifications",
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("notifications", "payload")
