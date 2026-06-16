from app.database import SessionLocal
from app.models.module import LearningModule, Lesson
from app.models.user import User, FeatureFlag
from app.services.seed import get_modules_with_lessons
from app.services.auth import hash_password
from app.config import settings

FEATURE_FLAGS = [
    {"key": "dashboard_module_vowel", "active": True, "behavior_on_inactive": "hide", "description": "Mostrar módulo Vogais"},
    {"key": "dashboard_module_consonant", "active": True, "behavior_on_inactive": "hide", "description": "Mostrar módulo Consoantes"},
    {"key": "dashboard_module_simple_syllable", "active": True, "behavior_on_inactive": "hide", "description": "Mostrar módulo Sílabas Simples"},
    {"key": "dashboard_module_complex_syllable", "active": True, "behavior_on_inactive": "hide", "description": "Mostrar módulo Sílabas Complexas"},
    {"key": "dashboard_module_blending", "active": True, "behavior_on_inactive": "hide", "description": "Mostrar módulo Montagem Silábica"},
    {"key": "dashboard_module_word", "active": True, "behavior_on_inactive": "hide", "description": "Mostrar módulo Palavras"},
    {"key": "dashboard_module_phrase", "active": True, "behavior_on_inactive": "hide", "description": "Mostrar módulo Frases"},
    {"key": "dashboard_module_sentence", "active": True, "behavior_on_inactive": "hide", "description": "Mostrar módulo Orações"},
    {"key": "feature_help_button", "active": True, "behavior_on_inactive": "hide", "description": "Mostrar botão de ajuda flutuante"},
    {"key": "feature_level_up", "active": True, "behavior_on_inactive": "hide", "description": "Mostrar animação de level up"},
    {"key": "feature_tutorial", "active": True, "behavior_on_inactive": "hide", "description": "Ativar tutorial guiado"},
]


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

        for flag_data in FEATURE_FLAGS:
            flag = FeatureFlag(**flag_data)
            db.add(flag)

        admin_user = User(
            name="Admin",
            email="admin@admin.com",
            password_hash=hash_password("admin123"),
            is_admin=True,
        )
        db.add(admin_user)

        db.commit()
        print(f"Seed complete: modules, lessons, feature flags, and admin user created.")

    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
