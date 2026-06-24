from sqlalchemy.orm import Session

from app.models.achievement import AchievementDefinition
from app.models.progress import UserProgress, Achievement
from app.models.module import LearningModule, Lesson


def _unlock(db: Session, user_id: int, achievement_type: str) -> bool:
    definition = db.query(AchievementDefinition).filter(
        AchievementDefinition.achievement_type == achievement_type,
        AchievementDefinition.active == True,
    ).first()
    if not definition:
        return False
    existing = db.query(Achievement).filter(
        Achievement.user_id == user_id,
        Achievement.achievement_type == achievement_type,
    ).first()
    if existing:
        return False
    db.add(Achievement(user_id=user_id, achievement_type=achievement_type))
    db.flush()
    return True


def check_and_unlock_achievements(
    lesson: Lesson,
    user_id: int,
    db: Session,
    data_errors: int = 0,
    score_attempts: int = 1,
    stars: int = 0,
):
    if data_errors == 0 and score_attempts > 0:
        _unlock(db, user_id, "no_errors")
        if stars >= 3:
            _unlock(db, user_id, "score_100")

    first_exists = db.query(Achievement).filter(
        Achievement.user_id == user_id,
        Achievement.achievement_type == "first_lesson",
    ).first()
    if not first_exists:
        _unlock(db, user_id, "first_lesson")

    module = db.query(LearningModule).filter(
        LearningModule.id == lesson.module_id,
    ).first()
    if module and module.module_type in ("vowel", "consonant"):
        total = db.query(Lesson).filter(
            Lesson.module_id == module.id,
            Lesson.active == True,
        ).count()
        completed = db.query(UserProgress).join(
            Lesson, UserProgress.lesson_id == Lesson.id,
        ).filter(
            Lesson.module_id == module.id,
            Lesson.active == True,
            UserProgress.user_id == user_id,
            UserProgress.completed == True,
        ).count()
        if total > 0 and completed >= total:
            _unlock(db, user_id, f"all_{module.module_type}s")
