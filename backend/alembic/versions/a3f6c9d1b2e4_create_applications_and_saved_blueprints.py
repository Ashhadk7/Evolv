"""create applications and saved_blueprints tables

Revision ID: a3f6c9d1b2e4
Revises: 56521dc74bd8
Create Date: 2026-07-09 04:00:00.000000
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "a3f6c9d1b2e4"
down_revision = "56521dc74bd8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "applications",
        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("developer_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("blueprint_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("connection_id", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column(
            "applied_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["developer_id"],
            ["developer_profiles.user_id"],
            name="applications_developer_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["blueprint_id"],
            ["blueprints.id"],
            name="applications_blueprint_id_fkey",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "developer_id", "blueprint_id", name="applications_developer_id_blueprint_id_key"
        ),
    )

    op.create_table(
        "saved_blueprints",
        sa.Column("developer_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("blueprint_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column(
            "saved_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["developer_id"],
            ["developer_profiles.user_id"],
            name="saved_blueprints_developer_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["blueprint_id"],
            ["blueprints.id"],
            name="saved_blueprints_blueprint_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("developer_id", "blueprint_id"),
    )


def downgrade() -> None:
    op.drop_table("saved_blueprints")
    op.drop_table("applications")
