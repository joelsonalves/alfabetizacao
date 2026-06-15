import asyncio
import logging
from datetime import datetime

from sqlalchemy import delete
from app.database import SessionLocal
from app.models.user import TokenBlocklist

logger = logging.getLogger(__name__)

CLEANUP_INTERVAL_SECONDS = 3600


async def clean_expired_blocklist():
    while True:
        try:
            db = SessionLocal()
            now = datetime.utcnow()
            result = db.execute(
                delete(TokenBlocklist).where(TokenBlocklist.expires_at < now)
            )
            db.commit()
            deleted = result.rowcount
            if deleted:
                logger.info("Cleaned %d expired tokens from blocklist", deleted)
        except Exception as exc:
            logger.error("Failed to clean blocklist: %s", exc)
        finally:
            db.close()
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)


def clean_expired_blocklist_sync(db):
    now = datetime.utcnow()
    result = db.execute(
        delete(TokenBlocklist).where(TokenBlocklist.expires_at < now)
    )
    db.commit()
    deleted = result.rowcount
    if deleted:
        logger.info("Cleaned %d expired tokens from blocklist", deleted)
