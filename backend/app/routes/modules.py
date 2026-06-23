from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.module import LearningModule, Lesson
from app.schemas.module import ModuleResponse, LessonResponse
from app.services.cache import cache

router = APIRouter()
lesson_router = APIRouter()


@router.get("", response_model=list[ModuleResponse])
def list_modules(db: Session = Depends(get_db)):
    cached = cache.get_json("modules:all")
    if cached is not None:
        return [ModuleResponse(**item) for item in cached]
    modules = db.query(LearningModule).order_by(LearningModule.sort_order).all()
    cache.set("modules:all", [ModuleResponse.model_validate(m).model_dump() for m in modules], ttl=settings.redis_ttl_catalog)
    return [ModuleResponse.model_validate(m) for m in modules]


@router.get("/{module_id}/lessons", response_model=list[LessonResponse])
def list_lessons(module_id: int, db: Session = Depends(get_db)):
    module = db.query(LearningModule).filter(LearningModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    lessons = db.query(Lesson).filter(Lesson.module_id == module_id, Lesson.active == True).order_by(Lesson.sort_order).all()
    return [LessonResponse.model_validate(l) for l in lessons]


@lesson_router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return LessonResponse.model_validate(lesson)
