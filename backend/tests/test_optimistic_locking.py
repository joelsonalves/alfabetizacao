import pytest

from app.models.module import LearningModule, Lesson
from app.models.progress import UserProgress


def _seed_lesson(db_session):
    module = LearningModule(
        name="Vogais", module_type="vowel",
        description="Aprenda as vogais", sort_order=1,
    )
    db_session.add(module)
    db_session.flush()
    lesson = Lesson(
        module_id=module.id, name="Vogal A",
        lesson_type="letter", target="A", sort_order=1,
    )
    db_session.add(lesson)
    db_session.commit()
    return lesson


@pytest.mark.asyncio
async def test_version_mismatch_causes_conflict(client, db_session, auth_headers):
    lesson = _seed_lesson(db_session)

    resp1 = await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=auth_headers,
        json={"score": 10, "stars": 1, "completed": False, "attempts": 1, "version": 0},
    )
    assert resp1.status_code == 200

    resp2 = await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=auth_headers,
        json={"score": 20, "stars": 2, "completed": False, "attempts": 1, "version": 0},
    )
    assert resp2.status_code == 409
    assert "Conflito" in resp2.json()["detail"]


@pytest.mark.asyncio
async def test_version_increments_after_successful_update(client, db_session, auth_headers):
    lesson = _seed_lesson(db_session)

    await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=auth_headers,
        json={"score": 10, "stars": 1, "completed": False, "attempts": 1},
    )
    await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=auth_headers,
        json={"score": 5, "stars": 1, "completed": False, "attempts": 1, "version": 1},
    )

    resp = await client.get("/api/progress", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    progress = [p for p in data if p["lesson_id"] == lesson.id]
    assert len(progress) == 1
    assert progress[0]["version"] == 2
