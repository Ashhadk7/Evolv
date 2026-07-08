"""add email otp hash to pending signups

Revision ID: 20260707_0002
Revises: 20260707_0001
Create Date: 2026-07-07
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "20260707_0002"
down_revision = "20260707_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    column_names = {column["name"] for column in inspector.get_columns("pending_signups")}

    if "email_otp_hash" not in column_names:
        op.add_column("pending_signups", sa.Column("email_otp_hash", sa.String(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    column_names = {column["name"] for column in inspector.get_columns("pending_signups")}

    if "email_otp_hash" in column_names:
        op.drop_column("pending_signups", "email_otp_hash")
