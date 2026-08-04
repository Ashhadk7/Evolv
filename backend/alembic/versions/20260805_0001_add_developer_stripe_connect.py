"""add developer stripe connect fields

Revision ID: 20260805_0001
Revises: 20260802_0001
Create Date: 2026-08-05
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "20260805_0001"
down_revision = "20260802_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("developer_profiles", sa.Column("stripe_account_id", sa.String(), nullable=True))
    op.add_column(
        "developer_profiles",
        sa.Column(
            "stripe_onboarding_complete",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "developer_profiles",
        sa.Column(
            "stripe_charges_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "developer_profiles",
        sa.Column(
            "stripe_payouts_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("developer_profiles", "stripe_payouts_enabled")
    op.drop_column("developer_profiles", "stripe_charges_enabled")
    op.drop_column("developer_profiles", "stripe_onboarding_complete")
    op.drop_column("developer_profiles", "stripe_account_id")
