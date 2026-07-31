"""Persist developer profile tags, skill metadata, and certification images.

Revision ID: 20260729_0002
Revises: 20260729_0001
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260729_0002"
down_revision: str | Sequence[str] | None = "20260729_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _json_empty_array_default() -> sa.TextClause:
    dialect = op.get_bind().dialect.name
    if dialect == "postgresql":
        return sa.text("'[]'::json")
    return sa.text("'[]'")


def upgrade() -> None:
    op.add_column(
        "developer_profiles",
        sa.Column(
            "tags",
            sa.JSON(),
            nullable=False,
            server_default=_json_empty_array_default(),
        ),
    )
    op.add_column(
        "developer_profiles",
        sa.Column(
            "skill_entries",
            sa.JSON(),
            nullable=False,
            server_default=_json_empty_array_default(),
        ),
    )
    op.add_column(
        "developer_certifications",
        sa.Column("image_url", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("developer_certifications", "image_url")
    op.drop_column("developer_profiles", "skill_entries")
    op.drop_column("developer_profiles", "tags")
