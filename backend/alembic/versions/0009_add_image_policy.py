"""add image_policy column to lessons

Revision ID: 0009
Revises: 0008
Create Date: 2026-06-23
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("lessons", sa.Column("image_policy", sa.String(length=20), nullable=False, server_default="auto"))
    op.execute(
        """
        UPDATE lessons
        SET image_policy = CASE
            WHEN image_active = false THEN 'none'
            ELSE 'auto'
        END
        """
    )


def downgrade() -> None:
    op.drop_column("lessons", "image_policy")
