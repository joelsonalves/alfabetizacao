from app.database import SessionLocal
from app.models.module import LearningModule, Lesson
from app.services.seed import get_modules_with_lessons


def seed():
    db = SessionLocal()
    try:
        existing = db.query(LearningModule).count()
        if existing > 0:
            print("Database already seeded. Skipping.")
            return

        for level_data in get_modules_with_lessons():
            lessons = level_data.pop("lessons", [])
            module = LearningModule(**level_data)
            db.add(module)
            db.flush()

            for lesson_data in lessons:
                lesson = Lesson(module_id=module.id, **lesson_data)
                db.add(lesson)

        db.commit()
        print(f"Seed complete: modules with lessons created.")

    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
