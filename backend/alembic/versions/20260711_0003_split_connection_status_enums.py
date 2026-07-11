"""Use separate status enums for messaging and network connections.

Revision ID: 20260711_0003
Revises: 20260711_0002
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20260711_0003"
down_revision: str | None = "20260711_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        "CREATE TYPE network_connection_status AS ENUM "
        "('pending', 'accepted', 'ignored', 'rejected')"
    )
    op.execute(
        "ALTER TABLE network_connections ALTER COLUMN status TYPE network_connection_status "
        "USING status::text::network_connection_status"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE network_connections ALTER COLUMN status TYPE connection_status "
        "USING CASE WHEN status::text IN ('ignored', 'rejected') "
        "THEN 'declined'::connection_status ELSE status::text::connection_status END"
    )
    op.execute("DROP TYPE network_connection_status")
