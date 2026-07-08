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
    op.add_column("pending_signups", sa.Column("email_otp_hash", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("pending_signups", "email_otp_hash")
