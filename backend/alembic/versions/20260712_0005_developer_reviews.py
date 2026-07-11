"""Store developer ratings and reviews.

Revision ID: 20260712_0005
Revises: 20260712_0004
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260712_0005"
down_revision: str | None = "20260712_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "developer_reviews",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("developer_user_id", sa.Uuid(), nullable=False),
        sa.Column("reviewer_user_id", sa.Uuid(), nullable=False),
        sa.Column("rating", sa.SmallInteger(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["developer_user_id"], ["developer_profiles.user_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewer_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "developer_user_id",
            "reviewer_user_id",
            name="uq_developer_reviews_developer_reviewer",
        ),
    )
    op.create_index("ix_developer_reviews_developer_user_id", "developer_reviews", ["developer_user_id"])
    op.create_index("ix_developer_reviews_reviewer_user_id", "developer_reviews", ["reviewer_user_id"])


def downgrade() -> None:
    op.drop_index("ix_developer_reviews_reviewer_user_id", table_name="developer_reviews")
    op.drop_index("ix_developer_reviews_developer_user_id", table_name="developer_reviews")
    op.drop_table("developer_reviews")
