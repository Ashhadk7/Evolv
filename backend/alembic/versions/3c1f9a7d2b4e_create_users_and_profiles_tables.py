"""create users, founder_profiles, and developer_profiles tables

Revision ID: 3c1f9a7d2b4e
Revises:
Create Date: 2026-07-08 12:00:00.000000
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "3c1f9a7d2b4e"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role = sa.Enum("founder", "developer", name="user_role", native_enum=True)

    bind = op.get_bind()
    user_role.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("first_name", sa.String(), nullable=False),
        sa.Column("last_name", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("country", sa.String(), nullable=True),
        sa.Column("country_code", sa.String(), nullable=True),
        sa.Column("state_province", sa.String(), nullable=True),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("dob", sa.Date(), nullable=True),
        sa.Column("gender", sa.String(), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("terms_accepted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "founder_profiles",
        sa.Column("user_id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("headline", sa.String(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("linkedin", sa.String(), nullable=True),
        sa.Column("venture_stage", sa.String(), nullable=True),
        sa.Column(
            "primary_goal",
            sa.String(),
            nullable=False,
            server_default="not_selected",
        ),
        sa.Column(
            "profile_complete",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "stripe_connected",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="founder_profiles_user_id_fkey",
            ondelete="CASCADE",
        ),
    )

    op.create_table(
        "developer_profiles",
        sa.Column("user_id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("job_title", sa.String(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("experience_years", sa.SmallInteger(), nullable=True),
        sa.Column(
            "availability",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "open_to_remote",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column("preferred_budget", sa.String(), nullable=True),
        sa.Column("github", sa.String(), nullable=True),
        sa.Column("linkedin", sa.String(), nullable=True),
        sa.Column("portfolio_link", sa.String(), nullable=True),
        sa.Column(
            "rating_avg",
            sa.Numeric(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "profile_complete",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="developer_profiles_user_id_fkey",
            ondelete="CASCADE",
        ),
    )


def downgrade() -> None:
    op.drop_table("developer_profiles")
    op.drop_table("founder_profiles")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    sa.Enum(name="user_role").drop(bind, checkfirst=True)
