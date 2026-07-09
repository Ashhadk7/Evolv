"""ensure user auth columns

Revision ID: 20260709_0002
Revises: 20260709_0001
Create Date: 2026-07-09
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "20260709_0002"
down_revision = "20260709_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column["name"] for column in inspector.get_columns("users")}

    if "email_verified" not in user_columns:
        op.add_column(
            "users",
            sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        )
        op.alter_column("users", "email_verified", server_default=None)

    if "email_otp_hash" not in user_columns:
        op.add_column("users", sa.Column("email_otp_hash", sa.String(), nullable=True))

    if "email_otp_expires_at" not in user_columns:
        op.add_column(
            "users",
            sa.Column("email_otp_expires_at", sa.DateTime(timezone=True), nullable=True),
        )

    if "phone_verified" not in user_columns:
        op.add_column(
            "users",
            sa.Column("phone_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        )
        op.alter_column("users", "phone_verified", server_default=None)

    op.execute("CREATE INDEX IF NOT EXISTS ix_users_email_verified ON users (email_verified)")


def downgrade() -> None:
    pass
