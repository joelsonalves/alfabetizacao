from unittest.mock import MagicMock, AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_unsplash_returns_non_200(client):
    mock_resp = MagicMock()
    mock_resp.status_code = 403

    with patch("app.config.settings.unsplash_access_key", "mock-key"):
        with patch("app.services.images.httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_cls.return_value = mock_client
            mock_client.__aenter__.return_value = mock_client
            mock_client.get = AsyncMock(return_value=mock_resp)

            response = await client.get("/api/images/word/casa")
            assert response.status_code == 200
            data = response.json()
            assert data["type"] == "emoji"


@pytest.mark.asyncio
async def test_unsplash_returns_empty_data(client):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json = MagicMock(return_value=[])

    with patch("app.config.settings.unsplash_access_key", "mock-key"):
        with patch("app.services.images.httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_cls.return_value = mock_client
            mock_client.__aenter__.return_value = mock_client
            mock_client.get = AsyncMock(return_value=mock_resp)

            response = await client.get("/api/images/word/casa")
            assert response.status_code == 200
            data = response.json()
            assert data["type"] == "emoji"
            assert data["value"] == "🏠"
