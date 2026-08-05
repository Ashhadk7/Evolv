"""add application message and availability

Revision ID: 20260802_0001
Revises: 20260729_0003
Create Date: 2026-08-02

An application used to carry only a role, which told the founder nothing about
why the developer is a fit. Both columns are nullable: existing applications
predate them and the apply form leaves availability optional.
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "20260802_0001"
down_revision = "20260729_0003"
branch_labels = None
depends_on = None

AVAILABILITY_OPTIONS = ("full_time", "part_time", "weekends")


def upgrade() -> None:
    op.add_column("applications", sa.Column("message", sa.Text(), nullable=True))
    op.add_column("applications", sa.Column("availability", sa.String(length=20), nullable=True))
    op.create_check_constraint(
        "ck_applications_availability_known",
        "applications",
        sa.text("availability IS NULL OR availability IN {}".format(AVAILABILITY_OPTIONS)),
    )


def downgrade() -> None:
    op.drop_constraint("ck_applications_availability_known", "applications")
    op.drop_column("applications", "availability")
    op.drop_column("applications", "message")
