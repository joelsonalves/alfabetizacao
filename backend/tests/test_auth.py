import pytest


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
