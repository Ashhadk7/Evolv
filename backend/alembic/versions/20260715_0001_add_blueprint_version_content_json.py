"""Add content_json column to blueprint_versions.

Revision ID: 20260715_0001
Revises: 20260712_0006
Create Date: 2026-07-15 00:00:00.000000
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260715_0001"
down_revision: str | Sequence[str] | None = "20260712_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "blueprint_versions",
        sa.Column("content_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("blueprint_versions", "content_json")
