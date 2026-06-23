import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.module import LearningModule, Lesson
from app.schemas.module import ModuleResponse, ModuleCreate, ModuleUpdate, LessonResponse, LessonCreate, LessonUpdate
from app.routes.auth import require_admin
from app.services.backfill_lesson_images import backfill_lesson_images

logger = logging.getLogger(__name__)

router = APIRouter()


class BackfillResponse(BaseModel):
    updated: int


@router.post("/lessons/backfill-images", response_model=BackfillResponse)
def backfill_images(_admin=Depends(require_admin), db: Session = Depends(get_db)):
    count = backfill_lesson_images(db)
    return BackfillResponse(updated=count)


class EmojiMappingItem(BaseModel):
    key: str
    emoji: str
    label: str


class EmojiMappingsResponse(BaseModel):
    letters: list[EmojiMappingItem]
    syllables: list[EmojiMappingItem]
    words: list[EmojiMappingItem]
    phrases: list[EmojiMappingItem]


@router.get("/emoji-mappings", response_model=EmojiMappingsResponse)
def list_emoji_mappings(_admin=Depends(require_admin)):
    from app.services.images import EMOJI_MAP, SYLLABLE_EMOJI_MAP, WORD_EMOJI_MAP

    def mapping(d, category, label_fmt):
        return [EmojiMappingItem(key=k, emoji=v, label=label_fmt(k))
                for k, v in sorted(d.items())]

    word_items = []
    phrase_items = []
    for k, v in sorted(WORD_EMOJI_MAP.items()):
        if " " in k:
            phrase_items.append(EmojiMappingItem(key=k, emoji=v, label=f"Frase: {k}"))
        else:
            word_items.append(EmojiMappingItem(key=k, emoji=v, label=f"Palavra {k}"))

    return EmojiMappingsResponse(
        letters=mapping(EMOJI_MAP, "letter", lambda k: f"Letra {k}"),
        syllables=mapping(SYLLABLE_EMOJI_MAP, "syllable", lambda k: f"Sílaba {k}"),
        words=word_items,
        phrases=phrase_items,
    )


@router.get("/modules", response_model=list[ModuleResponse])
def list_modules(_admin=Depends(require_admin), db: Session = Depends(get_db)):
    modules = db.query(LearningModule).order_by(LearningModule.sort_order).all()
    return [ModuleResponse.model_validate(m) for m in modules]


@router.post("/modules", response_model=ModuleResponse, status_code=201)
def create_module(data: ModuleCreate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    module = LearningModule(**data.model_dump())
    db.add(module)
    db.commit()
    db.refresh(module)
    return ModuleResponse.model_validate(module)


@router.patch("/modules/{module_id}", response_model=ModuleResponse)
def update_module(module_id: int, data: ModuleUpdate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    module = db.query(LearningModule).filter(LearningModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(module, key, value)
    db.commit()
    db.refresh(module)
    return ModuleResponse.model_validate(module)


@router.delete("/modules/{module_id}", status_code=204)
def delete_module(module_id: int, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    module = db.query(LearningModule).filter(LearningModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    db.query(Lesson).filter(Lesson.module_id == module_id).delete()
    db.delete(module)
    db.commit()


@router.get("/lessons", response_model=list[LessonResponse])
def list_lessons(module_id: int | None = None, module_type: str | None = None, active: bool | None = None,
                 _admin=Depends(require_admin), db: Session = Depends(get_db)):
    q = db.query(Lesson)
    if module_id is not None:
        q = q.filter(Lesson.module_id == module_id)
    if active is not None:
        q = q.filter(Lesson.active == active)
    if module_type is not None:
        q = q.join(LearningModule).filter(LearningModule.module_type == module_type)
    lessons = q.order_by(Lesson.module_id, Lesson.sort_order).all()
    return [LessonResponse.model_validate(l) for l in lessons]


@router.post("/lessons", response_model=LessonResponse, status_code=201)
def create_lesson(data: LessonCreate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    lesson = Lesson(**data.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return LessonResponse.model_validate(lesson)


@router.patch("/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson(lesson_id: int, data: LessonUpdate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lesson, key, value)
    db.commit()
    db.refresh(lesson)
    return LessonResponse.model_validate(lesson)


@router.delete("/lessons/{lesson_id}", status_code=204)
def delete_lesson(lesson_id: int, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
