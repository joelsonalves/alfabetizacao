from typing import Any
from pydantic import BaseModel


class ModuleResponse(BaseModel):
    id: int
    name: str
    module_type: str
    description: str | None
    sort_order: int

    class Config:
        from_attributes = True


class LessonResponse(BaseModel):
    id: int
    module_id: int
    name: str
    lesson_type: str
    target: str
    content: Any
    sort_order: int

    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    score: int
    stars: int
    completed: bool
    attempts: int


class ProgressResponse(BaseModel):
    id: int
    lesson_id: int
    score: int
    stars: int
    completed: bool
    completed_at: str | None

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj):
        if hasattr(obj, "completed_at") and obj.completed_at is not None:
            obj.completed_at = obj.completed_at.isoformat()
        return super().model_validate(obj)


class AchievementResponse(BaseModel):
    id: int
    achievement_type: str
    unlocked_at: str

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj):
        if hasattr(obj, "unlocked_at") and obj.unlocked_at is not None:
            obj.unlocked_at = obj.unlocked_at.isoformat()
        return super().model_validate(obj)
