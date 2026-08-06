"""Let a developer counter-offer a project invitation instead of only accept/decline.

Revision ID: 20260806_0001
Revises: 20260805_0006

Adds a `countered` status (developer proposed a different rate, awaiting the
founder) and a `counter_amount_cents` column holding that single proposal —
no back-and-forth thread, just the current offer on the table, same as the
rest of this state machine. The active-engagement unique index is recreated
to also treat `countered` as "still active" so a new invite can't be created
underneath an unresolved counter-offer.
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260806_0001"
down_revision: str | Sequence[str] | None = "20260805_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE project_member_status ADD VALUE IF NOT EXISTS 'countered'")

    op.add_column(
        "project_members",
        sa.Column("counter_amount_cents", sa.Integer(), nullable=True),
    )

    op.drop_index("uq_project_members_active_engagement", table_name="project_members")
    op.create_index(
        "uq_project_members_active_engagement",
        "project_members",
        ["project_id", "phase_index", "developer_id"],
        unique=True,
        postgresql_where=sa.text("status IN ('invited', 'accepted', 'countered')"),
    )


def downgrade() -> None:
    op.drop_index("uq_project_members_active_engagement", table_name="project_members")
    op.create_index(
        "uq_project_members_active_engagement",
        "project_members",
        ["project_id", "phase_index", "developer_id"],
        unique=True,
        postgresql_where=sa.text("status IN ('invited', 'accepted')"),
    )
    op.drop_column("project_members", "counter_amount_cents")
    # Postgres cannot drop a single enum value without rewriting the type;
    # leaving the unused 'countered' label in place is harmless, same
    # rationale as 20260805_0002's notif_type addition.
