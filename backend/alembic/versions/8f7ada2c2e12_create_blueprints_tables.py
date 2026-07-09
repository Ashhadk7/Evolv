"""create blueprints and blueprint_versions tables

Revision ID: 8f7ada2c2e12
Revises: 20260708_0001
Create Date: 2026-07-09 00:00:00.000000
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "8f7ada2c2e12"
down_revision = "20260708_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    blueprint_visibility = sa.Enum(
        "private", "public", name="blueprint_visibility", native_enum=True
    )
    version_state = sa.Enum("current", "pending", name="version_state", native_enum=True)
    level_rating = sa.Enum("High", "Medium", "Low", name="level_rating", native_enum=True)

    bind = op.get_bind()
    blueprint_visibility.create(bind, checkfirst=True)
    version_state.create(bind, checkfirst=True)
    level_rating.create(bind, checkfirst=True)

    op.create_table(
        "blueprints",
        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("founder_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column(
            "visibility",
            blueprint_visibility,
            nullable=False,
            server_default=sa.text("'private'::blueprint_visibility"),
        ),
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
            ["founder_id"],
            ["founder_profiles.user_id"],
            name="blueprints_founder_id_fkey",
            ondelete="CASCADE",
        ),
    )
    op.create_index("idx_blueprints_founder", "blueprints", ["founder_id"], unique=False)
    op.create_index(
        "idx_blueprints_public",
        "blueprints",
        ["visibility"],
        unique=False,
        postgresql_where=sa.text("visibility = 'public'::blueprint_visibility"),
    )

    op.create_table(
        "blueprint_versions",
        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("blueprint_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("state", version_state, nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("industry", sa.String(60), nullable=False),
        sa.Column("idea_desc", sa.Text(), nullable=False),
        sa.Column("differentiator", sa.Text(), nullable=True),
        sa.Column("ai_recommend", sa.Text(), nullable=True),
        sa.Column("viability", sa.SmallInteger(), nullable=False),
        sa.Column("market_potential", sa.SmallInteger(), nullable=False),
        sa.Column("funding_readiness", level_rating, nullable=False),
        sa.Column("developer_demand", level_rating, nullable=False),
        sa.Column(
            "generated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["blueprint_id"],
            ["blueprints.id"],
            name="blueprint_versions_blueprint_id_fkey",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "blueprint_id", "state", name="blueprint_versions_blueprint_id_state_key"
        ),
        sa.CheckConstraint(
            "viability >= 0 AND viability <= 100", name="blueprint_versions_viability_check"
        ),
        sa.CheckConstraint(
            "market_potential >= 0 AND market_potential <= 100",
            name="blueprint_versions_market_potential_check",
        ),
    )


def downgrade() -> None:
    op.drop_table("blueprint_versions")
    op.drop_index("idx_blueprints_public", table_name="blueprints")
    op.drop_index("idx_blueprints_founder", table_name="blueprints")
    op.drop_table("blueprints")

    bind = op.get_bind()
    sa.Enum(name="level_rating").drop(bind, checkfirst=True)
    sa.Enum(name="version_state").drop(bind, checkfirst=True)
    sa.Enum(name="blueprint_visibility").drop(bind, checkfirst=True)
