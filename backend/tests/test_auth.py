import pytest
from app.services.auth import create_refresh_token, decode_access_token, get_token_jti


@pytest.mark.asyncio
async def test_register(client):
    response = await client.post("/api/auth/register", json={
        "name": "Novo Usuário",
        "email": "novo@teste.com",
        "password": "123456",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["name"] == "Novo Usuário"
    assert data["user"]["email"] == "novo@teste.com"


@pytest.mark.asyncio
async def test_register_duplicate_email(client, test_user):
    response = await client.post("/api/auth/register", json={
        "name": "Duplicado",
        "email": "teste@teste.com",
        "password": "123456",
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_short_password(client):
    response = await client.post("/api/auth/register", json={
        "name": "Curta",
        "email": "curta@teste.com",
        "password": "123",
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login(client, test_user):
    response = await client.post("/api/auth/login", json={
        "email": "teste@teste.com",
        "password": "123456",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "teste@teste.com"


@pytest.mark.asyncio
async def test_login_invalid_password(client, test_user):
    response = await client.post("/api/auth/login", json={
        "email": "teste@teste.com",
        "password": "wrongpass",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    response = await client.post("/api/auth/login", json={
        "email": "naoexiste@teste.com",
        "password": "123456",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_authenticated(client, auth_headers):
    response = await client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "teste@teste.com"


@pytest.mark.asyncio
async def test_me_unauthenticated(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_invalid_token(client):
    response = await client.get("/api/auth/me", headers={"Authorization": "Bearer invalid-token"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(client, test_user):
    login_resp = await client.post("/api/auth/login", json={
        "email": "teste@teste.com", "password": "123456",
    })
    refresh_token = login_resp.json()["refresh_token"]

    response = await client.post("/api/auth/refresh", json={
        "refresh_token": refresh_token,
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_refresh_token_reuse_revoked(client, test_user):
    login_resp = await client.post("/api/auth/login", json={
        "email": "teste@teste.com", "password": "123456",
    })
    refresh_token = login_resp.json()["refresh_token"]

    resp1 = await client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert resp1.status_code == 200

    resp2 = await client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert resp2.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_invalid(client):
    response = await client.post("/api/auth/refresh", json={
        "refresh_token": "invalid-token",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_logout(client, test_user):
    login_resp = await client.post("/api/auth/login", json={
        "email": "teste@teste.com", "password": "123456",
    })
    refresh_token = login_resp.json()["refresh_token"]

    response = await client.post("/api/auth/logout", json={
        "refresh_token": refresh_token,
    })
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Logged out successfully"


@pytest.mark.asyncio
async def test_get_token_jti(client, auth_token):
    jti = get_token_jti(auth_token)
    assert jti is not None
    assert isinstance(jti, str)


def test_get_token_jti_invalid():
    assert get_token_jti("invalid-token") is None
