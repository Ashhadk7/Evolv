from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = '9f9b07a5d8d6'
down_revision = 'd4d52f3b9c0b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('educations',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('level', sa.String(), nullable=False),
    sa.Column('degree', sa.String(), nullable=True),
    sa.Column('custom_degree', sa.String(), nullable=True),
    sa.Column('school', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_educations_user_id'), 'educations', ['user_id'], unique=False)
    op.create_table('network_connections',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('requester_id', sa.Uuid(), nullable=False),
    sa.Column('receiver_id', sa.Uuid(), nullable=False),
    sa.Column('status', sa.Enum('pending', 'accepted', 'ignored', 'rejected', name='connection_status'), nullable=False),
    sa.Column('note', sa.String(length=500), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['receiver_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['requester_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('requester_id', 'receiver_id', name='uq_requester_receiver')
    )
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=False))
    op.add_column('users', sa.Column('email_otp_hash', sa.String(), nullable=True))
    op.add_column('users', sa.Column('email_otp_expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('phone_verified', sa.Boolean(), nullable=False))


def downgrade() -> None:
    op.drop_column('users', 'phone_verified')
    op.drop_column('users', 'email_otp_expires_at')
    op.drop_column('users', 'email_otp_hash')
    op.drop_column('users', 'email_verified')
    op.drop_table('network_connections')
    op.drop_index(op.f('ix_educations_user_id'), table_name='educations')
    op.drop_table('educations')
