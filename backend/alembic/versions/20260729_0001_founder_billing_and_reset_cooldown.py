"""Persist founder billing settings and reset request timestamps.

Revision ID: 20260729_0001
Revises: 20260723_0002
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260729_0001"
down_revision: str | Sequence[str] | None = "20260723_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("password_reset_otp_sent_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "founder_profiles",
        sa.Column("billing_plan", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "founder_profiles",
        sa.Column("billing_email", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "founder_profiles",
        sa.Column("billing_currency", sa.String(length=10), nullable=True),
    )
    op.add_column(
        "founder_profiles",
        sa.Column("billing_budget_range", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "founder_profiles",
        sa.Column("payment_method", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "founder_profiles",
        sa.Column("billing_company_name", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("founder_profiles", "billing_company_name")
    op.drop_column("founder_profiles", "payment_method")
    op.drop_column("founder_profiles", "billing_budget_range")
    op.drop_column("founder_profiles", "billing_currency")
    op.drop_column("founder_profiles", "billing_email")
    op.drop_column("founder_profiles", "billing_plan")
    op.drop_column("users", "password_reset_otp_sent_at")
