from app.models.progress import UserProgress
from app.schemas.module import ProgressUpdate


def calculate_level(xp: int, current_level: int) -> int:
    level = current_level
    while xp >= level * 500:
        level += 1
    return level


def xp_needed_for_level(level: int) -> int:
    return level * 500


def check_version_conflict(progress: UserProgress, data_version: int | None) -> bool:
    if data_version is not None and progress.version != data_version:
        return True
    return False


def apply_progress_update(progress: UserProgress, data: ProgressUpdate) -> None:
    progress.score = (progress.score or 0) + data.score
    progress.stars = max(progress.stars or 0, data.stars)
    progress.attempts = (progress.attempts or 0) + data.attempts
    if data.completed and not progress.completed:
        progress.completed = True
        from datetime import datetime
        progress.completed_at = datetime.utcnow()
    progress.version = (progress.version or 0) + 1
