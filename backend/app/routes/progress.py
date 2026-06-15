from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.progress import UserProgress, Achievement, Session as UserSession
from app.models.module import Lesson
from app.schemas.module import ProgressUpdate, ProgressResponse, AchievementResponse
from app.routes.auth import get_current_user

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
    elif data.version is not None and progress.version != data.version:
        raise HTTPException(
            status_code=409,
            detail="Conflito: progresso atualizado por outra aba. Recarregue e tente novamente.",
        )

    progress.score = (progress.score or 0) + data.score
    progress.stars = max(progress.stars or 0, data.stars)
    progress.attempts = (progress.attempts or 0) + data.attempts
    if data.completed and not progress.completed:
        progress.completed = True
        progress.completed_at = datetime.utcnow()

    progress.version = (progress.version or 0) + 1

    user.xp += data.score

    while user.xp >= user.level * 500:
        user.level += 1

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
