"""initial_schema

Revision ID: 0001
Revises:
Create Date: 2026-06-13
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("level", sa.Integer(), server_default="1"),
        sa.Column("xp", sa.Integer(), server_default="0"),
        sa.Column("streak", sa.Integer(), server_default="0"),
        sa.Column("last_active_date", sa.DateTime(), nullable=True),
        sa.Column("tutorial_completed", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"])

    op.create_table(
        "learning_modules",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("module_type", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_learning_modules_id", "learning_modules", ["id"])

    op.create_table(
        "lessons",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("module_id", sa.Integer(), sa.ForeignKey("learning_modules.id"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("lesson_type", sa.String(50), nullable=False),
        sa.Column("target", sa.String(100), nullable=False),
        sa.Column("content", sa.JSON(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_lessons_id", "lessons", ["id"])

    op.create_table(
        "user_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id"), nullable=False),
        sa.Column("score", sa.Integer(), server_default="0"),
        sa.Column("stars", sa.Integer(), server_default="0"),
        sa.Column("completed", sa.Boolean(), server_default="false"),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("attempts", sa.Integer(), server_default="0"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_progress_id", "user_progress", ["id"])
    op.create_index("ix_user_progress_user_id", "user_progress", ["user_id"])

    op.create_table(
        "achievements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("achievement_type", sa.String(50), nullable=False),
        sa.Column("unlocked_at", sa.DateTime(), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_achievements_id", "achievements", ["id"])
    op.create_index("ix_achievements_user_id", "achievements", ["user_id"])

    op.create_table(
        "sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("start_time", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("end_time", sa.DateTime(), nullable=True),
        sa.Column("points_earned", sa.Integer(), server_default="0"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_sessions_id", "sessions", ["id"])
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"])

    op.create_table(
        "lesson_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id"), nullable=False),
        sa.Column("reference", sa.String(50), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("source", sa.String(50), server_default="emoji"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("lesson_images")
    op.drop_table("sessions")
    op.drop_table("achievements")
    op.drop_table("user_progress")
    op.drop_table("lessons")
    op.drop_table("learning_modules")
    op.drop_table("users")
