"""add emoji_mappings table

Revision ID: 0007
Revises: 0006
Create Date: 2026-06-22
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "emoji_mappings",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("mapping_type", sa.String(length=20), nullable=False),
        sa.Column("key", sa.String(length=50), nullable=False),
        sa.Column("emoji", sa.String(length=30), nullable=False),
        sa.Column("label", sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_emoji_mappings_type", "emoji_mappings", ["mapping_type"])
    op.create_index("ix_emoji_mappings_type_key", "emoji_mappings", ["mapping_type", "key"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_emoji_mappings_type_key", table_name="emoji_mappings")
    op.drop_index("ix_emoji_mappings_type", table_name="emoji_mappings")
    op.drop_table("emoji_mappings")
