"""Create the deadline assignee join table.

Revision ID: 20260805_0004
Revises: 20260805_0003
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260805_0004"
down_revision: str | Sequence[str] | None = "20260805_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "project_deadline_assignees",
        sa.Column("deadline_id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("user_id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("met_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["deadline_id"], ["project_deadlines.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(
        "ix_project_deadline_assignees_user_id", "project_deadline_assignees", ["user_id"]
    )


def downgrade() -> None:
    op.drop_table("project_deadline_assignees")
