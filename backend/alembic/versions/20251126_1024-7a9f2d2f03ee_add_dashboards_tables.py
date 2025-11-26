"""add_dashboards_tables

Revision ID: 7a9f2d2f03ee
Revises: 9c624815aac6
Create Date: 2025-11-26 10:24:12.989338

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a9f2d2f03ee'
down_revision: Union[str, None] = '9c624815aac6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create dashboards table
    op.create_table(
        'dashboards',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('pipeline_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('config', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('theme', sa.String(length=50), nullable=False, server_default='light'),
        sa.Column('layout', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['pipeline_id'], ['pipelines.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_dashboards_pipeline_id', 'dashboards', ['pipeline_id'])
    op.create_index('ix_dashboards_created_by', 'dashboards', ['created_by'])

    # Create dashboard_shares table
    op.create_table(
        'dashboard_shares',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('dashboard_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('permission', sa.String(length=50), nullable=False, server_default='view'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['dashboard_id'], ['dashboards.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('dashboard_id', 'user_id', name='unique_dashboard_user_share'),
    )
    op.create_index('ix_dashboard_shares_dashboard_id', 'dashboard_shares', ['dashboard_id'])
    op.create_index('ix_dashboard_shares_user_id', 'dashboard_shares', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_dashboard_shares_user_id', 'dashboard_shares')
    op.drop_index('ix_dashboard_shares_dashboard_id', 'dashboard_shares')
    op.drop_table('dashboard_shares')

    op.drop_index('ix_dashboards_created_by', 'dashboards')
    op.drop_index('ix_dashboards_pipeline_id', 'dashboards')
    op.drop_table('dashboards')
