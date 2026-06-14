import pytest


@pytest.mark.asyncio
async def test_list_achievements_empty(client, auth_headers):
    response = await client.get("/api/progress/achievements", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_unlock_achievement(client, auth_headers):
    response = await client.post(
        "/api/progress/achievements/primeira_letra",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "unlocked"


@pytest.mark.asyncio
async def test_unlock_duplicate_achievement(client, auth_headers):
    await client.post(
        "/api/progress/achievements/primeira_letra",
        headers=auth_headers,
    )
    response = await client.post(
        "/api/progress/achievements/primeira_letra",
        headers=auth_headers,
    )
    assert response.json()["status"] == "already_unlocked"


@pytest.mark.asyncio
async def test_list_achievements_with_data(client, auth_headers):
    await client.post(
        "/api/progress/achievements/primeira_letra",
        headers=auth_headers,
    )
    await client.post(
        "/api/progress/achievements/perfeito",
        headers=auth_headers,
    )
    response = await client.get("/api/progress/achievements", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    types = [a["achievement_type"] for a in data]
    assert "primeira_letra" in types
    assert "perfeito" in types


@pytest.mark.asyncio
async def test_achievements_unauthenticated(client):
    response = await client.get("/api/progress/achievements")
    assert response.status_code == 401
