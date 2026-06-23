from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.module import Lesson
from app.services.images import (
    get_emoji_for_letter,
    get_emoji_for_syllable,
    get_emoji_for_word,
    get_emoji_for_text,
)


def resolve_image_for_lesson(lesson_type: str, target: str) -> str | None:
    if lesson_type in ("letter", "consonant"):
        return get_emoji_for_letter(target)
    if lesson_type == "syllable":
        return get_emoji_for_syllable(target)
    if lesson_type in ("word", "blending"):
        return get_emoji_for_word(target)
    if lesson_type in ("phrase", "sentence"):
        return get_emoji_for_text(target)
    return None


def backfill_lesson_images(db: Session) -> int:
    count = 0
    lessons = db.query(Lesson).filter(Lesson.image_url.is_(None)).all()
    for lesson in lessons:
        url = resolve_image_for_lesson(lesson.lesson_type, lesson.target)
        if url:
            lesson.image_url = url
            count += 1
    db.commit()
    return count


def main():
    db = SessionLocal()
    try:
        count = backfill_lesson_images(db)
        print(f"Backfill complete: {count} lessons updated.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
