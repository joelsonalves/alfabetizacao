import pytest
from app.models.achievement import AchievementDefinition


@pytest.fixture(autouse=True)
def seed_definitions(db_session):
    for atype in ("primeira_letra", "perfeito"):
        exists = db_session.query(AchievementDefinition).filter(AchievementDefinition.achievement_type == atype).first()
        if not exists:
            db_session.add(AchievementDefinition(achievement_type=atype, name=atype.capitalize()))
    db_session.commit()


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
async def test_non_definition_achievement_fails(client, auth_headers):
    response = await client.post(
        "/api/progress/achievements/tipo_inexistente",
        headers=auth_headers,
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_achievements_unauthenticated(client):
    response = await client.get("/api/progress/achievements")
    assert response.status_code == 401
