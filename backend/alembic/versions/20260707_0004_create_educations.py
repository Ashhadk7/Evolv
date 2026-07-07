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
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("educations"):
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
    else:
        column_names = {column["name"] for column in inspector.get_columns("educations")}
        if "user_id" not in column_names:
            op.add_column("educations", sa.Column("user_id", sa.Uuid(), nullable=True))
        if "level" not in column_names:
            op.add_column("educations", sa.Column("level", sa.String(), nullable=True))
        if "degree" not in column_names:
            op.add_column("educations", sa.Column("degree", sa.String(), nullable=True))
        if "custom_degree" not in column_names:
            op.add_column("educations", sa.Column("custom_degree", sa.String(), nullable=True))
        if "school" not in column_names:
            op.add_column("educations", sa.Column("school", sa.String(), nullable=True))

    op.execute("CREATE INDEX IF NOT EXISTS ix_educations_user_id ON educations (user_id)")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("educations"):
        op.execute("DROP INDEX IF EXISTS ix_educations_user_id")
        op.drop_table("educations")
