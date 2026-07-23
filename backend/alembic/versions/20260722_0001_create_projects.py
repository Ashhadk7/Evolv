"""Create projects table.

Revision ID: 20260722_0001
Revises: 20260716_0001
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260722_0001"
down_revision: str | None = "20260716_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    project_status = postgresql.ENUM(
        "active",
        "paused",
        "completed",
        "cancelled",
        name="project_status",
        create_type=False,
    )

    bind = op.get_bind()
    project_status.create(bind, checkfirst=True)

    op.create_table(
        "projects",
        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("blueprint_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("founder_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("developer_id", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column("status", project_status, nullable=False, server_default="active"),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("milestones", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["blueprint_id"],
            ["blueprints.id"],
            name="projects_blueprint_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["founder_id"],
            ["founder_profiles.user_id"],
            name="projects_founder_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["developer_id"],
            ["developer_profiles.user_id"],
            name="projects_developer_id_fkey",
            ondelete="SET NULL",
        ),
    )
    op.create_index(
        "ix_projects_founder_id_created_at",
        "projects",
        ["founder_id", "created_at"],
    )
    op.create_index(
        "ix_projects_blueprint_id",
        "projects",
        ["blueprint_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_projects_blueprint_id", table_name="projects")
    op.drop_index("ix_projects_founder_id_created_at", table_name="projects")
    op.drop_table("projects")

    bind = op.get_bind()
    postgresql.ENUM(name="project_status").drop(bind, checkfirst=True)
