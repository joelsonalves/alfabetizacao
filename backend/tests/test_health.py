import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "alfabetizacao-multissensorial"
    assert "uptime_seconds" in data
    assert data["database"] == "ok"


@pytest.mark.asyncio
async def test_metrics(client, test_user):
    response = await client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "total_lessons_completed" in data
    assert "total_achievements" in data
    assert "active_users_today" in data
