from datetime import datetime, timedelta

import pytest

from app.models.user import TokenBlocklist
from app.services.cleanup import clean_expired_blocklist_sync


@pytest.mark.asyncio
async def test_sync_cleanup_deletes_expired_tokens(db_session):
    entry = TokenBlocklist(
        jti="expired-jti",
        token_type="access",
        user_id=1,
        expires_at=datetime.utcnow() - timedelta(hours=1),
    )
    db_session.add(entry)
    db_session.commit()

    clean_expired_blocklist_sync(db_session)

    remaining = db_session.query(TokenBlocklist).all()
    assert len(remaining) == 0


@pytest.mark.asyncio
async def test_sync_cleanup_keeps_valid_tokens(db_session, test_user):
    valid_entry = TokenBlocklist(
        jti="valid-jti",
        token_type="access",
        user_id=test_user.id,
        expires_at=datetime.utcnow() + timedelta(hours=24),
    )
    db_session.add(valid_entry)
    db_session.commit()

    clean_expired_blocklist_sync(db_session)

    remaining = db_session.query(TokenBlocklist).all()
    assert len(remaining) == 1
    assert remaining[0].jti == "valid-jti"


@pytest.mark.asyncio
async def test_async_cleanup_task_starts_without_error():
    import asyncio

    from app.services.cleanup import clean_expired_blocklist

    assert asyncio.iscoroutinefunction(clean_expired_blocklist)

    coro = clean_expired_blocklist()
    assert asyncio.iscoroutine(coro)
    coro.close()
