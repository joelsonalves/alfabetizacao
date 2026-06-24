from typing import Any
from pydantic import BaseModel

from app.utils.datetime import datetime_to_iso


class ModuleResponse(BaseModel):
    id: int
    name: str
    module_type: str
    description: str | None
    sort_order: int

    class Config:
        from_attributes = True


class ModuleCreate(BaseModel):
    name: str
    module_type: str
    description: str | None = None
    sort_order: int


class ModuleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    sort_order: int | None = None


VALID_IMAGE_POLICIES = {"auto", "none", "custom"}


class LessonResponse(BaseModel):
    id: int
    module_id: int
    name: str
    lesson_type: str
    target: str
    content: Any
    sort_order: int
    active: bool = True
    image_url: str | None = None
    image_active: bool = True
    image_policy: str = "auto"
    alt_text: str | None = None
    placeholder_text: str | None = None
    association_word: str | None = None

    class Config:
        from_attributes = True


class LessonCreate(BaseModel):
    name: str
    lesson_type: str
    target: str
    content: Any = None
    sort_order: int
    module_id: int
    active: bool = True
    image_url: str | None = None
    image_active: bool = True
    image_policy: str = "auto"
    alt_text: str | None = None
    placeholder_text: str | None = None
    association_word: str | None = None


class LessonUpdate(BaseModel):
    name: str | None = None
    lesson_type: str | None = None
    target: str | None = None
    content: Any = None
    sort_order: int | None = None
    active: bool | None = None
    image_url: str | None = None
    image_active: bool | None = None
    image_policy: str | None = None
    alt_text: str | None = None
    placeholder_text: str | None = None
    association_word: str | None = None


class ProgressUpdate(BaseModel):
    score: int
    stars: int
    completed: bool
    attempts: int
    errors: int = 0
    version: int | None = None


class ProgressResponse(BaseModel):
    id: int
    lesson_id: int
    score: int
    stars: int
    completed: bool
    completed_at: str | None
    version: int = 0

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj):
        if hasattr(obj, "completed_at"):
            obj.completed_at = datetime_to_iso(obj.completed_at)
        return super().model_validate(obj)


class AchievementResponse(BaseModel):
    id: int
    achievement_type: str
    unlocked_at: str

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj):
        if hasattr(obj, "unlocked_at"):
            obj.unlocked_at = datetime_to_iso(obj.unlocked_at)
        return super().model_validate(obj)
