from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.progress import UserProgress, Achievement, Session as UserSession
from app.models.module import Lesson
from app.schemas.module import ProgressUpdate, ProgressResponse, AchievementResponse
from app.routes.auth import get_current_user
from app.services.progress import calculate_level, check_version_conflict, apply_progress_update

router = APIRouter()


@router.post("/lesson/{lesson_id}")
def update_progress(
    lesson_id: int,
    data: ProgressUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user.id,
        UserProgress.lesson_id == lesson_id,
    ).first()

    if not progress:
        progress = UserProgress(user_id=user.id, lesson_id=lesson_id)
        db.add(progress)
        db.flush()
    elif check_version_conflict(progress, data.version):
        raise HTTPException(
            status_code=409,
            detail="Conflito: progresso atualizado por outra aba. Recarregue e tente novamente.",
        )

    apply_progress_update(progress, data)

    user.xp += data.score

    user.level = calculate_level(user.xp, user.level)

    db.commit()
    db.refresh(progress)

    return {"status": "ok", "xp": user.xp, "level": user.level}


@router.get("", response_model=list[ProgressResponse])
def get_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress = db.query(UserProgress).filter(UserProgress.user_id == user.id).all()
    return [ProgressResponse.model_validate(p) for p in progress]


@router.get("/achievements", response_model=list[AchievementResponse])
def get_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    achievements = db.query(Achievement).filter(Achievement.user_id == user.id).all()
    return [AchievementResponse.model_validate(a) for a in achievements]


@router.post("/achievements/{achievement_type}")
def unlock_achievement(
    achievement_type: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Achievement).filter(
        Achievement.user_id == user.id,
        Achievement.achievement_type == achievement_type,
    ).first()
    if existing:
        return {"status": "already_unlocked"}

    achievement = Achievement(user_id=user.id, achievement_type=achievement_type)
    db.add(achievement)
    db.commit()

    return {"status": "unlocked"}
