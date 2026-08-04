"""preserve local payment branch stamp

Revision ID: 20260802_0001
Revises: 20260729_0003
Create Date: 2026-08-02

Some local databases were stamped with this revision before the payment branch
was cleaned up. The schema changes needed by the current branch live in the
next migration.
"""

from __future__ import annotations

revision = "20260802_0001"
down_revision = "20260729_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
