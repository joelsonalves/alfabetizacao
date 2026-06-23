from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.module import Lesson
from app.services.images import (
    get_emoji_for_letter,
    get_emoji_for_syllable,
    get_emoji_for_word,
    get_emoji_for_text,
    get_association_for_letter,
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


def resolve_association_for_lesson(lesson_type: str, target: str) -> str | None:
    if lesson_type in ("letter", "consonant"):
        return get_association_for_letter(target)
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


def backfill_lesson_images_force(db: Session) -> int:
    """Recalcula image_url de TODAS as lições.

    Apenas lições cujo image_url difere do valor resolvido são atualizadas,
    preservando edições manuais feitas via admin.
    """
    count = 0
    lessons = db.query(Lesson).all()
    for lesson in lessons:
        resolved = resolve_image_for_lesson(lesson.lesson_type, lesson.target)
        if resolved and lesson.image_url != resolved:
            lesson.image_url = resolved
            count += 1
    db.commit()
    return count


def backfill_association_words(db: Session) -> int:
    count = 0
    lessons = db.query(Lesson).filter(
        Lesson.lesson_type.in_(["letter", "consonant"]),
        Lesson.association_word.is_(None),
    ).all()
    for lesson in lessons:
        word = resolve_association_for_lesson(lesson.lesson_type, lesson.target)
        if word:
            lesson.association_word = word
            count += 1
    db.commit()
    return count


def main():
    import sys
    db = SessionLocal()
    try:
        if "--force" in sys.argv:
            count = backfill_lesson_images_force(db)
            print(f"Force backfill complete: {count} lessons updated.")
        else:
            count = backfill_lesson_images(db)
            print(f"Backfill complete: {count} lessons updated.")
    finally:
        db.close()


if __name__ == "__main__":
    main()

