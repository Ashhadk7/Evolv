"""Add user notification preferences.

Revision ID: 20260723_0001
Revises: 20260722_0002
Create Date: 2026-07-23 00:00:00.000000
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260723_0001"
down_revision: str | Sequence[str] | None = "20260722_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    server_default = (
        sa.text("'{}'::json")
        if bind.dialect.name == "postgresql"
        else sa.text("'{}'")
    )
    op.add_column(
        "users",
        sa.Column(
            "notification_preferences",
            sa.JSON(),
            nullable=False,
            server_default=server_default,
        ),
    )
    op.alter_column("users", "notification_preferences", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "notification_preferences")
