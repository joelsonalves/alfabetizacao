import pytest
from app.models.module import LearningModule, Lesson


def _seed_modules(db_session):
    module = LearningModule(
        name="Vogais",
        module_type="vowel",
        description="Aprenda as vogais",
        sort_order=1,
    )
    db_session.add(module)
    db_session.flush()

    lesson = Lesson(
        module_id=module.id,
        name="Vogal A",
        lesson_type="letter",
        target="A",
        sort_order=1,
    )
    db_session.add(lesson)
    db_session.commit()
    return module, lesson


@pytest.mark.asyncio
async def test_list_modules(client, db_session):
    _seed_modules(db_session)
    response = await client.get("/api/modules")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Vogais"


@pytest.mark.asyncio
async def test_list_modules_empty(client):
    response = await client.get("/api/modules")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_list_lessons(client, db_session):
    module, _ = _seed_modules(db_session)
    response = await client.get(f"/api/modules/{module.id}/lessons")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["target"] == "A"


@pytest.mark.asyncio
async def test_list_lessons_module_not_found(client):
    response = await client.get("/api/modules/999/lessons")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_lesson(client, db_session):
    _, lesson = _seed_modules(db_session)
    response = await client.get(f"/api/lessons/{lesson.id}")
    assert response.status_code == 200
    assert response.json()["target"] == "A"


@pytest.mark.asyncio
async def test_get_lesson_not_found(client):
    response = await client.get("/api/lessons/999")
    assert response.status_code == 404
