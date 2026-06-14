"""add token_blocklist table

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-13
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "token_blocklist",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("jti", sa.String(255), nullable=False),
        sa.Column("token_type", sa.String(50), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_token_blocklist_jti", "token_blocklist", ["jti"])
    op.create_index("ix_token_blocklist_user_id", "token_blocklist", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_token_blocklist_user_id")
    op.drop_index("ix_token_blocklist_jti")
    op.drop_table("token_blocklist")
