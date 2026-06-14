import pytest
from app.models.module import LearningModule, Lesson
from app.models.user import User
from app.services.auth import hash_password


def _seed_lesson(db_session):
    module = LearningModule(name="Vogais", module_type="vowel", description="", sort_order=1)
    db_session.add(module)
    db_session.flush()
    lesson = Lesson(module_id=module.id, name="Vogal A", lesson_type="letter", target="A", sort_order=1)
    db_session.add(lesson)
    db_session.commit()
    return lesson


@pytest.mark.asyncio
async def test_level_up_on_xp_threshold(client, db_session, auth_headers, test_user):
    lesson = _seed_lesson(db_session)
    test_user.xp = 450
    db_session.commit()

    response = await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=auth_headers,
        json={"score": 100, "stars": 3, "completed": True, "attempts": 1},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["level"] == 2

    db_session.refresh(test_user)
    assert test_user.level == 2
    assert test_user.xp == 550


@pytest.mark.asyncio
async def test_no_level_up_below_threshold(client, db_session, auth_headers, test_user):
    lesson = _seed_lesson(db_session)
    test_user.xp = 300
    db_session.commit()

    response = await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=auth_headers,
        json={"score": 50, "stars": 2, "completed": True, "attempts": 1},
    )
    data = response.json()
    assert data["level"] == 1


@pytest.mark.asyncio
async def test_multiple_level_ups(client, db_session, auth_headers, test_user):
    lesson = _seed_lesson(db_session)
    test_user.xp = 1400
    db_session.commit()

    response = await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=auth_headers,
        json={"score": 200, "stars": 3, "completed": True, "attempts": 1},
    )
    data = response.json()
    assert data["level"] == 4
