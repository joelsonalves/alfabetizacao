from datetime import datetime, timedelta
import pytest
from app.models.user import User
from app.services.auth import hash_password


@pytest.mark.asyncio
async def test_streak_starts_at_one(client, db_session):
    user = User(name="Streak", email="streak@teste.com", password_hash=hash_password("123456"))
    db_session.add(user)
    db_session.commit()

    response = await client.post("/api/auth/login", json={
        "email": "streak@teste.com", "password": "123456",
    })
    assert response.status_code == 200
    db_session.refresh(user)
    assert user.streak == 1


@pytest.mark.asyncio
async def test_streak_increments_on_consecutive_day(client, db_session):
    yesterday = datetime.utcnow() - timedelta(days=1)
    user = User(
        name="Streak", email="streak2@teste.com",
        password_hash=hash_password("123456"),
        streak=5, last_active_date=yesterday,
    )
    db_session.add(user)
    db_session.commit()

    response = await client.post("/api/auth/login", json={
        "email": "streak2@teste.com", "password": "123456",
    })
    assert response.status_code == 200
    db_session.refresh(user)
    assert user.streak == 6


@pytest.mark.asyncio
async def test_streak_resets_after_missed_day(client, db_session):
    two_days_ago = datetime.utcnow() - timedelta(days=2)
    user = User(
        name="Streak", email="streak3@teste.com",
        password_hash=hash_password("123456"),
        streak=10, last_active_date=two_days_ago,
    )
    db_session.add(user)
    db_session.commit()

    response = await client.post("/api/auth/login", json={
        "email": "streak3@teste.com", "password": "123456",
    })
    assert response.status_code == 200
    db_session.refresh(user)
    assert user.streak == 1


@pytest.mark.asyncio
async def test_streak_same_day_no_increment(client, db_session):
    today = datetime.utcnow()
    user = User(
        name="Streak", email="streak4@teste.com",
        password_hash=hash_password("123456"),
        streak=3, last_active_date=today,
    )
    db_session.add(user)
    db_session.commit()

    response = await client.post("/api/auth/login", json={
        "email": "streak4@teste.com", "password": "123456",
    })
    assert response.status_code == 200
    db_session.refresh(user)
    assert user.streak == 3
