import pytest


@pytest.mark.asyncio
async def test_get_emoji(client):
    response = await client.get("/api/images/emoji/A")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "emoji"
    assert "value" in data
    assert data["letter"] == "A"


@pytest.mark.asyncio
async def test_get_emoji_lowercase(client):
    response = await client.get("/api/images/emoji/b")
    assert response.status_code == 200
    assert response.json()["letter"] == "B"


@pytest.mark.asyncio
async def test_get_emoji_not_found(client):
    response = await client.get("/api/images/emoji/1")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_word_image_fallback(client):
    response = await client.get("/api/images/word/casa")
    assert response.status_code == 200
    data = response.json()
    assert data["word"] == "casa"
    assert data["type"] in ("emoji", "unsplash")
