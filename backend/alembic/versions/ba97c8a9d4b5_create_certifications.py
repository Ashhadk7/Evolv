from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = 'ba97c8a9d4b5'
down_revision = '9f9b07a5d8d6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('developer_certifications',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('issuer', sa.String(), nullable=False),
    sa.Column('issue_date', sa.String(), nullable=True),
    sa.Column('credential_id', sa.String(), nullable=True),
    sa.Column('credential_url', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_developer_certifications_user_id'), 'developer_certifications', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_developer_certifications_user_id'), table_name='developer_certifications')
    op.drop_table('developer_certifications')
