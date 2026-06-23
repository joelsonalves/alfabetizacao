"""add association_word column to lessons

Revision ID: 0005
Revises: 77b10cc16541
Create Date: 2026-06-22
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0005"
down_revision: Union[str, None] = "77b10cc16541"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("lessons", sa.Column("association_word", sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column("lessons", "association_word")
