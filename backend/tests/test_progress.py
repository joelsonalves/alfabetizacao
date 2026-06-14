import pytest
from app.models.module import LearningModule, Lesson


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
async def test_save_progress(client, db_session, auth_headers):
    lesson = _seed_lesson(db_session)
    response = await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=auth_headers,
        json={"score": 50, "stars": 3, "completed": True, "attempts": 1},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["xp"] >= 50


@pytest.mark.asyncio
async def test_get_progress(client, db_session, auth_headers, test_user):
    lesson = _seed_lesson(db_session)
    await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=auth_headers,
        json={"score": 50, "stars": 3, "completed": True, "attempts": 1},
    )
    response = await client.get("/api/progress", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["lesson_id"] == lesson.id
    assert data[0]["completed"] is True


@pytest.mark.asyncio
async def test_save_progress_unauthenticated(client, db_session):
    lesson = _seed_lesson(db_session)
    response = await client.post(
        f"/api/progress/lesson/{lesson.id}",
        json={"score": 10, "stars": 1, "completed": False, "attempts": 1},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_save_progress_lesson_not_found(client, auth_headers):
    response = await client.post(
        "/api/progress/lesson/999",
        headers=auth_headers,
        json={"score": 10, "stars": 1, "completed": False, "attempts": 1},
    )
    assert response.status_code == 404
