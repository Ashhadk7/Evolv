"""drop blueprint funding readiness

Revision ID: 20260716_0001
Revises: 20260715_0001
Create Date: 2026-07-16 00:00:00.000000
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260716_0001"
down_revision: str | Sequence[str] | None = "20260715_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_column("blueprint_versions", "funding_readiness")


def downgrade() -> None:
    level_rating = sa.Enum("High", "Medium", "Low", name="level_rating", native_enum=True)
    op.add_column(
        "blueprint_versions",
        sa.Column(
            "funding_readiness",
            level_rating,
            nullable=False,
            server_default=sa.text("'Medium'::level_rating"),
        ),
    )
    op.alter_column("blueprint_versions", "funding_readiness", server_default=None)
