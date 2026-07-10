"""merge heads

Revision ID: 041a39dc3083
Revises: a3f6c9d1b2e4, ba97c8a9d4b5, d6f41c36d811
Create Date: 2026-07-09 23:03:16.542477
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = '041a39dc3083'
down_revision = ('a3f6c9d1b2e4', 'ba97c8a9d4b5', 'd6f41c36d811')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
