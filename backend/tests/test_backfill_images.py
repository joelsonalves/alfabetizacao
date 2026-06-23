import pytest
from app.models.module import LearningModule, Lesson
from app.services.backfill_lesson_images import backfill_lesson_images, resolve_image_for_lesson


def _seed_lesson(db_session, lesson_type="letter", target="A", image_url=None):
    module = LearningModule(name="Test", module_type="vowel", description="", sort_order=1)
    db_session.add(module)
    db_session.flush()
    lesson = Lesson(
        module_id=module.id,
        name=f"Test {target}",
        lesson_type=lesson_type,
        target=target,
        sort_order=1,
        image_url=image_url,
    )
    db_session.add(lesson)
    db_session.commit()
    return lesson


class TestResolveImageForLesson:
    def test_letter(self):
        assert resolve_image_for_lesson("letter", "A") == "🐝"

    def test_consonant(self):
        assert resolve_image_for_lesson("consonant", "P") == "🐧"

    def test_syllable(self):
        assert resolve_image_for_lesson("syllable", "BA") == "🍬"

    def test_word(self):
        assert resolve_image_for_lesson("word", "CASA") == "🏠"

    def test_blending(self):
        assert resolve_image_for_lesson("blending", "CASA") == "🏠"

    def test_phrase(self):
        assert resolve_image_for_lesson("phrase", "O GATO BEBE") == "🐱"

    def test_sentence(self):
        assert resolve_image_for_lesson("sentence", "O GATO BEBEU LEITE.") == "🐱"

    def test_review_returns_none(self):
        assert resolve_image_for_lesson("review", "AEIOU") is None

    def test_unknown_type_returns_none(self):
        assert resolve_image_for_lesson("unknown", "XYZ") is None


class TestBackfillLessonImages:
    def test_updates_lessons_with_null_image(self, db_session):
        _seed_lesson(db_session, "letter", "A", image_url=None)
        _seed_lesson(db_session, "word", "CASA", image_url=None)
        _seed_lesson(db_session, "phrase", "O GATO BEBE", image_url=None)
        _seed_lesson(db_session, "review", "AEIOU", image_url=None)

        count = backfill_lesson_images(db_session)
        assert count == 3
        lessons = db_session.query(Lesson).all()
        urls = [l.image_url for l in lessons]
        assert "🐝" in urls
        assert "🏠" in urls
        assert "🐱" in urls

    def test_does_not_overwrite_existing_images(self, db_session):
        _seed_lesson(db_session, "letter", "A", image_url="🐶")
        count = backfill_lesson_images(db_session)
        assert count == 0

    def test_idempotent(self, db_session):
        _seed_lesson(db_session, "letter", "A", image_url=None)
        backfill_lesson_images(db_session)
        count = backfill_lesson_images(db_session)
        assert count == 0


class TestAdminBackfillEndpoint:
    @pytest.mark.asyncio
    async def test_requires_auth(self, client):
        response = await client.post("/api/admin/lessons/backfill-images")
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_returns_updated_count(self, client, db_session, auth_headers):
        _seed_lesson(db_session, "letter", "A", image_url=None)
        _seed_lesson(db_session, "word", "CASA", image_url=None)

        response = await client.post(
            "/api/admin/lessons/backfill-images",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["updated"] == 2

    @pytest.mark.asyncio
    async def test_no_updates_when_all_populated(self, client, db_session, auth_headers):
        _seed_lesson(db_session, "letter", "A", image_url="🐝")

        response = await client.post(
            "/api/admin/lessons/backfill-images",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["updated"] == 0
