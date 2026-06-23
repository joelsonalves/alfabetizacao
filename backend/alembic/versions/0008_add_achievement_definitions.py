"""add achievement_definitions table

Revision ID: 0008
Revises: 0007
Create Date: 2026-06-22
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "achievement_definitions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("achievement_type", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("icon", sa.String(length=30), nullable=True),
        sa.Column("criteria", sa.String(length=500), nullable=True),
        sa.Column("active", sa.Boolean(), server_default=sa.text("true"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_achievement_definitions_type", "achievement_definitions", ["achievement_type"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_achievement_definitions_type", table_name="achievement_definitions")
    op.drop_table("achievement_definitions")
