"""Add role selected by developer applications.

Revision ID: 20260722_0001
Revises: 20260716_0001
Create Date: 2026-07-22 00:00:00.000000
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260722_0001"
down_revision: str | Sequence[str] | None = "20260716_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("applications", sa.Column("role", sa.String(length=255), nullable=True))
    op.add_column(
        "applications",
        sa.Column("status", sa.String(length=30), nullable=False, server_default="applied"),
    )
    op.add_column(
        "applications",
        sa.Column("withdrawn_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_check_constraint(
        "ck_applications_status",
        "applications",
        "status in ('applied', 'withdrawn')",
    )
    op.alter_column("applications", "status", server_default=None)


def downgrade() -> None:
    op.drop_constraint("ck_applications_status", "applications", type_="check")
    op.drop_column("applications", "withdrawn_at")
    op.drop_column("applications", "status")
    op.drop_column("applications", "role")
