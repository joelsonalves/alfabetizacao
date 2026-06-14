import pytest


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
async def test_progress_update_negative_values(client, auth_headers):
    response = await client.post(
        "/api/progress/lesson/1",
        headers=auth_headers,
        json={"score": -10, "stars": -1, "completed": False, "attempts": -1},
    )
    assert response.status_code == 422 or response.status_code == 200


@pytest.mark.asyncio
async def test_invalid_http_method(client):
    response = await client.delete("/api/auth/register")
    assert response.status_code == 405


@pytest.mark.asyncio
async def test_malformed_json(client):
    response = await client.post("/api/auth/register", data="not-json", headers={"Content-Type": "application/json"})
    assert response.status_code == 422
