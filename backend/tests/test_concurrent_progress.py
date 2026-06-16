import pytest

from app.models.module import LearningModule, Lesson
from app.services.auth import create_access_token, hash_password
from app.models.user import User


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


def _create_user(db_session, name, email):
    user = User(
        name=name,
        email=email,
        password_hash=hash_password("123456"),
    )
    db_session.add(user)
    db_session.commit()
    return user


@pytest.mark.asyncio
async def test_two_users_save_progress_same_lesson(client, db_session):
    lesson = _seed_lesson(db_session)
    user_a = _create_user(db_session, "Alice", "alice@teste.com")
    user_b = _create_user(db_session, "Bob", "bob@teste.com")

    token_a = create_access_token({"sub": user_a.id, "email": user_a.email})
    token_b = create_access_token({"sub": user_b.id, "email": user_b.email})

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    resp_a = await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=headers_a,
        json={"score": 30, "stars": 2, "completed": False, "attempts": 1, "version": 0},
    )
    assert resp_a.status_code == 200

    resp_b = await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=headers_b,
        json={"score": 50, "stars": 3, "completed": False, "attempts": 1, "version": 0},
    )
    assert resp_b.status_code == 200

    resp_a_progress = await client.get("/api/progress", headers=headers_a)
    assert resp_a_progress.status_code == 200
    data_a = resp_a_progress.json()
    assert len(data_a) == 1
    assert data_a[0]["score"] >= 30

    resp_b_progress = await client.get("/api/progress", headers=headers_b)
    assert resp_b_progress.status_code == 200
    data_b = resp_b_progress.json()
    assert len(data_b) == 1
    assert data_b[0]["score"] >= 50
