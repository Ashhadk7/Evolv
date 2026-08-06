"""Give deliverables a review workflow instead of a done flag.

Revision ID: 20260805_0006
Revises: 20260805_0005

A developer moves a deliverable as far as in_review; only the founder marks it
done. The boolean is replaced rather than kept alongside the enum so there is
one source of truth for whether a deliverable is finished.
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260805_0006"
down_revision: str | Sequence[str] | None = "20260805_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

STATUS_ENUM = sa.Enum(
    "todo",
    "in_progress",
    "in_review",
    "done",
    name="project_deliverable_status",
    native_enum=True,
    create_type=False,
)


def upgrade() -> None:
    STATUS_ENUM.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "project_deliverables",
        sa.Column("status", STATUS_ENUM, nullable=False, server_default="todo"),
    )
    op.execute(
        "UPDATE project_deliverables SET status = 'done' WHERE done IS TRUE"
    )
    op.drop_column("project_deliverables", "done")
    op.create_index(
        "ix_project_deliverables_project_id_status",
        "project_deliverables",
        ["project_id", "status"],
    )


def downgrade() -> None:
    op.drop_index("ix_project_deliverables_project_id_status", "project_deliverables")
    op.add_column(
        "project_deliverables",
        sa.Column("done", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.execute("UPDATE project_deliverables SET done = TRUE WHERE status = 'done'")
    op.drop_column("project_deliverables", "status")
    STATUS_ENUM.drop(op.get_bind(), checkfirst=True)
