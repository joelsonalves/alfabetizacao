import pytest
from app.models.module import LearningModule, Lesson


@pytest.mark.asyncio
async def test_register_missing_fields(client):
    response = await client.post("/api/auth/register", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email(client):
    response = await client.post("/api/auth/register", json={
        "name": "Test", "email": "not-an-email", "password": "123456",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_short_password(client):
    response = await client.post("/api/auth/register", json={
        "name": "Test", "email": "test@test.com", "password": "123",
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_missing_fields(client):
    response = await client.post("/api/auth/login", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_progress_update_invalid_payload(client, auth_headers):
    response = await client.post(
        "/api/progress/lesson/1",
        headers=auth_headers,
        json={"score": "not-a-number", "stars": "invalid"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_progress_update_negative_values(client, auth_headers, db_session):
    module = LearningModule(name="Test", module_type="vowel", description="", sort_order=1)
    db_session.add(module)
    db_session.flush()
    lesson = Lesson(module_id=module.id, name="Test", lesson_type="letter", target="A", sort_order=1)
    db_session.add(lesson)
    db_session.commit()

    response = await client.post(
        f"/api/progress/lesson/{lesson.id}",
        headers=auth_headers,
        json={"score": -10, "stars": -1, "completed": False, "attempts": -1},
    )
    assert response.status_code in (422, 200)


@pytest.mark.asyncio
async def test_invalid_http_method(client):
    response = await client.delete("/api/auth/register")
    assert response.status_code == 405


@pytest.mark.asyncio
async def test_malformed_json(client):
    response = await client.post("/api/auth/register", data="not-json", headers={"Content-Type": "application/json"})
    assert response.status_code == 422
