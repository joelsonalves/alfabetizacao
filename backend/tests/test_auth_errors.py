from datetime import datetime

import pytest

from app.models.user import TokenBlocklist
from app.services.auth import get_token_jti


@pytest.mark.asyncio
async def test_missing_authorization_header(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


@pytest.mark.asyncio
async def test_invalid_authorization_scheme(client, auth_token):
    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Basic {auth_token}"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid auth scheme"


@pytest.mark.asyncio
async def test_revoked_token_blocklisted_jti(client, db_session, auth_token):
    jti = get_token_jti(auth_token)
    assert jti is not None

    entry = TokenBlocklist(
        jti=jti,
        token_type="access",
        user_id=1,
        expires_at=datetime.utcnow(),
    )
    db_session.add(entry)
    db_session.commit()

    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Token revoked"
