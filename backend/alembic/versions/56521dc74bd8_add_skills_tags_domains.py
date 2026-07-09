"""add_skills_tags_domains

Revision ID: 56521dc74bd8
Revises: 8f7ada2c2e12
Create Date: 2026-07-08 11:56:28.427772
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "56521dc74bd8"
down_revision = "8f7ada2c2e12"
branch_labels = None
depends_on = None


def upgrade() -> None:
    skill_kind = sa.Enum(
        "Skill", "Tech stack", "Framework", "Tool", name="skill_kind", native_enum=True
    )
    skill_experience = sa.Enum(
        "Learning", "< 1 year", "1-2 years", "3-5 years", "5+ years",
        name="skill_experience", native_enum=True,
    )
    bind = op.get_bind()
    skill_kind.create(bind, checkfirst=True)
    skill_experience.create(bind, checkfirst=True)

    op.create_table(
        "domains",
        sa.Column("id", sa.SmallInteger(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=60), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="domains_name_key"),
    )

    op.create_table(
        "skills",
        sa.Column("id", sa.SmallInteger(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="skills_name_key"),
    )

    op.create_table(
        "tags",
        sa.Column("id", sa.SmallInteger(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=60), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="tags_name_key"),
    )

    op.create_table(
        "user_skills",
        sa.Column(
            "id", sa.Uuid(as_uuid=True), primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("skill_id", sa.SmallInteger(), nullable=False),
        sa.Column("kind", skill_kind, nullable=False),
        sa.Column("experience_level", skill_experience, nullable=False),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"], name="user_skills_skill_id_fkey"),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="user_skills_user_id_fkey", ondelete="CASCADE"
        ),
        sa.UniqueConstraint(
            "user_id", "skill_id", "kind", name="user_skills_user_id_skill_id_kind_key"
        ),
    )

    op.create_table(
        "developer_tags",
        sa.Column("developer_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("tag_id", sa.SmallInteger(), nullable=False),
        sa.ForeignKeyConstraint(
            ["developer_id"],
            ["developer_profiles.user_id"],
            name="developer_tags_developer_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], name="developer_tags_tag_id_fkey"),
        sa.PrimaryKeyConstraint("developer_id", "tag_id"),
    )

    op.create_table(
        "founder_domains",
        sa.Column("founder_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("domain_id", sa.SmallInteger(), nullable=False),
        sa.ForeignKeyConstraint(
            ["domain_id"], ["domains.id"], name="founder_domains_domain_id_fkey"
        ),
        sa.ForeignKeyConstraint(
            ["founder_id"],
            ["founder_profiles.user_id"],
            name="founder_domains_founder_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("founder_id", "domain_id"),
    )


def downgrade() -> None:
    op.drop_table("founder_domains")
    op.drop_table("developer_tags")
    op.drop_table("user_skills")
    op.drop_table("tags")
    op.drop_table("skills")
    op.drop_table("domains")

    bind = op.get_bind()
    sa.Enum(name="skill_experience").drop(bind, checkfirst=True)
    sa.Enum(name="skill_kind").drop(bind, checkfirst=True)
