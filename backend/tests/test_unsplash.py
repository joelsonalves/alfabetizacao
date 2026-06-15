import pytest
from unittest.mock import patch, MagicMock, AsyncMock


def _make_mock_response(status_code: int, json_data: list | None = None):
    mock_resp = MagicMock()
    mock_resp.status_code = status_code
    if json_data is not None:
        mock_resp.json = MagicMock(return_value=json_data)
    return mock_resp


@pytest.mark.asyncio
async def test_word_image_with_unsplash_key(client):
    mock_resp = _make_mock_response(200, [{
        "urls": {"regular": "https://images.unsplash.com/photo-test"},
        "alt_description": "A house",
    }])

    with patch("app.config.settings.unsplash_access_key", "mock-key"):
        with patch("app.routes.images.httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_cls.return_value = mock_client
            mock_client.__aenter__.return_value = mock_client
            mock_client.get = AsyncMock(return_value=mock_resp)

            response = await client.get("/api/images/word/casa")
            assert response.status_code == 200
            data = response.json()
            assert data["type"] == "unsplash"
            assert data["url"] == "https://images.unsplash.com/photo-test"


@pytest.mark.asyncio
async def test_word_image_unsplash_api_error(client):
    with patch("app.config.settings.unsplash_access_key", "mock-key"):
        with patch("app.routes.images.httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_cls.return_value = mock_client
            mock_client.__aenter__.return_value = mock_client
            mock_client.get = AsyncMock(side_effect=Exception("API error"))

            response = await client.get("/api/images/word/casa")
            assert response.status_code == 200
            data = response.json()
            assert data["type"] == "emoji"


@pytest.mark.asyncio
async def test_word_image_unsplash_non_200(client):
    mock_resp = _make_mock_response(403)

    with patch("app.config.settings.unsplash_access_key", "mock-key"):
        with patch("app.routes.images.httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_cls.return_value = mock_client
            mock_client.__aenter__.return_value = mock_client
            mock_client.get = AsyncMock(return_value=mock_resp)

            response = await client.get("/api/images/word/casa")
            assert response.status_code == 200
            data = response.json()
            assert data["type"] == "emoji"
