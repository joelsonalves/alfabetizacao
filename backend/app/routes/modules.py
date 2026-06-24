from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.module import LearningModule, Lesson
from app.models.user import FeatureFlag
from app.schemas.module import ModuleResponse, LessonResponse
from app.services.cache import cache

router = APIRouter()
lesson_router = APIRouter()

MODULE_TYPE_FLAG_MAP: dict[str, str] = {
    "vowel": "dashboard_module_vowel",
    "consonant": "dashboard_module_consonant",
    "simple_syllable": "dashboard_module_simple_syllable",
    "complex_syllable": "dashboard_module_complex_syllable",
    "blending": "dashboard_module_blending",
    "word": "dashboard_module_word",
    "phrase": "dashboard_module_phrase",
    "sentence": "dashboard_module_sentence",
}


def _is_module_active(module_type: str, db: Session) -> bool:
    flag_key = MODULE_TYPE_FLAG_MAP.get(module_type)
    if flag_key is None:
        return True
    flag = db.query(FeatureFlag).filter(FeatureFlag.key == flag_key).first()
    if flag is None:
        return True
    return flag.active


@router.get("", response_model=list[ModuleResponse])
def list_modules(db: Session = Depends(get_db)):
    cached = cache.get_json("modules:all")
    if cached is not None:
        modules = [ModuleResponse(**item) for item in cached]
    else:
        modules = db.query(LearningModule).order_by(LearningModule.sort_order).all()
        modules = [ModuleResponse.model_validate(m) for m in modules]
        cache.set("modules:all", [m.model_dump() for m in modules], ttl=settings.redis_ttl_catalog)
    return [m for m in modules if _is_module_active(m.module_type, db)]


@router.get("/{module_id}/lessons", response_model=list[LessonResponse])
def list_lessons(module_id: int, db: Session = Depends(get_db)):
    module = db.query(LearningModule).filter(LearningModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    if not _is_module_active(module.module_type, db):
        raise HTTPException(status_code=403, detail="Module is disabled by administrator")
    lessons = db.query(Lesson).filter(Lesson.module_id == module_id, Lesson.active == True).order_by(Lesson.sort_order).all()
    return [LessonResponse.model_validate(l) for l in lessons]


@lesson_router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    module = db.query(LearningModule).filter(LearningModule.id == lesson.module_id).first()
    if module and not _is_module_active(module.module_type, db):
        raise HTTPException(status_code=403, detail="Module is disabled by administrator")
    return LessonResponse.model_validate(lesson)
