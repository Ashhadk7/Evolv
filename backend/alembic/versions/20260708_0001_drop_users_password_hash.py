"""drop users password hash

Revision ID: 20260708_0001
Revises: 20260707_0004
Create Date: 2026-07-08
"""

import sqlalchemy as sa

from alembic import op

revision = "20260708_0001"
down_revision = "20260707_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("users"):
        return

    column_names = {column["name"] for column in inspector.get_columns("users")}
    if "password_hash" in column_names:
        op.drop_column("users", "password_hash")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("users"):
        return

    column_names = {column["name"] for column in inspector.get_columns("users")}
    if "password_hash" not in column_names:
        op.add_column("users", sa.Column("password_hash", sa.String(), nullable=True))
