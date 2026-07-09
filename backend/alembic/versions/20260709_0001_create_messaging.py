"""create messaging

Revision ID: 20260709_0001
Revises: 20260708_0001
Create Date: 2026-07-09
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "20260709_0001"
down_revision = "20260708_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection_status = sa.Enum("pending", "accepted", "declined", name="connection_status")
    connection_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "message_connections",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("requester_id", sa.Uuid(), nullable=False),
        sa.Column("addressee_id", sa.Uuid(), nullable=False),
        sa.Column("status", connection_status, nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("declined_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "requester_id <> addressee_id",
            name="ck_message_connections_not_self",
        ),
        sa.ForeignKeyConstraint(["addressee_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["requester_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "requester_id",
            "addressee_id",
            name="uq_message_connections_requester_addressee",
        ),
    )
    op.create_index(
        "ix_message_connections_addressee_id",
        "message_connections",
        ["addressee_id"],
    )
    op.create_index(
        "ix_message_connections_requester_id",
        "message_connections",
        ["requester_id"],
    )
    op.create_index("ix_message_connections_status", "message_connections", ["status"])

    op.create_table(
        "messages",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("connection_id", sa.Uuid(), nullable=False),
        sa.Column("sender_id", sa.Uuid(), nullable=False),
        sa.Column("recipient_id", sa.Uuid(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["connection_id"], ["message_connections.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_messages_connection_id_created_at",
        "messages",
        ["connection_id", "created_at"],
    )
    op.create_index("ix_messages_recipient_id_read_at", "messages", ["recipient_id", "read_at"])


def downgrade() -> None:
    op.drop_index("ix_messages_recipient_id_read_at", table_name="messages")
    op.drop_index("ix_messages_connection_id_created_at", table_name="messages")
    op.drop_table("messages")
    op.drop_index("ix_message_connections_status", table_name="message_connections")
    op.drop_index("ix_message_connections_requester_id", table_name="message_connections")
    op.drop_index("ix_message_connections_addressee_id", table_name="message_connections")
    op.drop_table("message_connections")
    sa.Enum("pending", "accepted", "declined", name="connection_status").drop(
        op.get_bind(),
        checkfirst=True,
    )
