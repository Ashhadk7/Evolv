"""create educations

Revision ID: 20260707_0004
Revises: 20260707_0003
Create Date: 2026-07-07
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "20260707_0004"
down_revision = "20260707_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "educations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("level", sa.String(), nullable=False),
        sa.Column("degree", sa.String(), nullable=True),
        sa.Column("custom_degree", sa.String(), nullable=True),
        sa.Column("school", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_educations_user_id", "educations", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_educations_user_id", table_name="educations")
    op.drop_table("educations")
