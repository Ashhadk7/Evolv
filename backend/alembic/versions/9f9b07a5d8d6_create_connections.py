from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = '9f9b07a5d8d6'
down_revision = 'd4d52f3b9c0b'
branch_labels = None
depends_on = None


from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM


def upgrade() -> None:
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_status') THEN
                CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'ignored', 'rejected');
            END IF;
        END$$;
    """)

    op.create_table('network_connections',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('requester_id', sa.Uuid(), nullable=False),
    sa.Column('receiver_id', sa.Uuid(), nullable=False),
    sa.Column('status', PG_ENUM('pending', 'accepted', 'ignored', 'rejected', name='connection_status', create_type=False), nullable=False),

    sa.Column('note', sa.String(length=500), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['receiver_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['requester_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('requester_id', 'receiver_id', name='uq_requester_receiver')
    )


def downgrade() -> None:
    op.drop_table('network_connections')


