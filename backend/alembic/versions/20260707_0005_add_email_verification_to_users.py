"""add email verification fields to users

Revision ID: 20260707_0005
Revises: 20260707_0004
Create Date: 2026-07-07
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "20260707_0005"
down_revision = "20260707_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column["name"] for column in inspector.get_columns("users")}

    if "email_verified" not in user_columns:
        op.add_column(
            "users",
            sa.Column("email_verified", sa.Boolean(), server_default=sa.true(), nullable=False),
        )
        op.alter_column("users", "email_verified", server_default=sa.false())

    if "email_otp_hash" not in user_columns:
        op.add_column("users", sa.Column("email_otp_hash", sa.String(), nullable=True))

    if "email_otp_expires_at" not in user_columns:
        op.add_column(
            "users",
            sa.Column("email_otp_expires_at", sa.DateTime(timezone=True), nullable=True),
        )

    op.execute("CREATE INDEX IF NOT EXISTS ix_users_email_verified ON users (email_verified)")

    if inspector.has_table("pending_signups"):
        op.execute("DROP INDEX IF EXISTS ix_pending_signups_email")
        op.drop_table("pending_signups")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column["name"] for column in inspector.get_columns("users")}

    op.execute("DROP INDEX IF EXISTS ix_users_email_verified")

    if "email_otp_expires_at" in user_columns:
        op.drop_column("users", "email_otp_expires_at")
    if "email_otp_hash" in user_columns:
        op.drop_column("users", "email_otp_hash")
    if "email_verified" in user_columns:
        op.drop_column("users", "email_verified")
