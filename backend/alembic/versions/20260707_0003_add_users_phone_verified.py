"""add users phone verified

Revision ID: 20260707_0003
Revises: 20260707_0002
Create Date: 2026-07-07
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "20260707_0003"
down_revision = "20260707_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "phone_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.alter_column("users", "phone_verified", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "phone_verified")
