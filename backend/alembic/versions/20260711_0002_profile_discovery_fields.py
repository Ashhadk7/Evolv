"""Add profile discovery fields.

Revision ID: 20260711_0002
Revises: 041a39dc3083
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260711_0002"
down_revision: str | None = "041a39dc3083"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("founder_profiles", sa.Column("domains", sa.JSON(), nullable=True))
    op.add_column("developer_profiles", sa.Column("skills", sa.JSON(), nullable=True))
    op.execute("UPDATE founder_profiles SET domains = '[]' WHERE domains IS NULL")
    op.execute("UPDATE developer_profiles SET skills = '[]' WHERE skills IS NULL")
    op.alter_column("founder_profiles", "domains", nullable=False)
    op.alter_column("developer_profiles", "skills", nullable=False)


def downgrade() -> None:
    op.drop_column("developer_profiles", "skills")
    op.drop_column("founder_profiles", "domains")
