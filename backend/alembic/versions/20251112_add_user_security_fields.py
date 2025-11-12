"""add user security fields

Revision ID: 20251112_security
Revises: c126159880e7
Create Date: 2025-11-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20251112_security'
down_revision: Union[str, None] = 'c126159880e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add failed_login_attempts column
    op.add_column(
        'users',
        sa.Column(
            'failed_login_attempts',
            sa.Integer(),
            nullable=False,
            server_default='0'
        )
    )

    # Add locked_until column
    op.add_column(
        'users',
        sa.Column(
            'locked_until',
            sa.DateTime(timezone=True),
            nullable=True
        )
    )


def downgrade() -> None:
    # Remove columns
    op.drop_column('users', 'locked_until')
    op.drop_column('users', 'failed_login_attempts')
