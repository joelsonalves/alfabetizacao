import pytest
from unittest.mock import patch


@pytest.mark.asyncio
async def test_word_image_with_unsplash_key(client):
    with patch("app.routes.images.settings.unsplash_access_key", "mock-key"):
        with patch("httpx.AsyncClient.get") as mock_get:
            mock_response = mock_get.return_value.__aenter__.return_value
            mock_response.status_code = 200
            mock_response.json.return_value = [{
                "urls": {"regular": "https://images.unsplash.com/photo-test"},
                "alt_description": "A house",
            }]

            response = await client.get("/api/images/word/casa")
            assert response.status_code == 200
            data = response.json()
            assert data["type"] == "unsplash"
            assert data["url"] == "https://images.unsplash.com/photo-test"


@pytest.mark.asyncio
async def test_word_image_unsplash_api_error(client):
    with patch("app.routes.images.settings.unsplash_access_key", "mock-key"):
        with patch("httpx.AsyncClient.get") as mock_get:
            mock_get.side_effect = Exception("API error")

            response = await client.get("/api/images/word/casa")
            assert response.status_code == 200
            data = response.json()
            assert data["type"] == "emoji"


@pytest.mark.asyncio
async def test_word_image_unsplash_non_200(client):
    with patch("app.routes.images.settings.unsplash_access_key", "mock-key"):
        with patch("httpx.AsyncClient.get") as mock_get:
            mock_response = mock_get.return_value.__aenter__.return_value
            mock_response.status_code = 403

            response = await client.get("/api/images/word/casa")
            assert response.status_code == 200
            data = response.json()
            assert data["type"] == "emoji"
