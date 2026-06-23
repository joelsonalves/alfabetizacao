import json
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# Import lazy do redis — permite que o app funcione mesmo se a lib não estiver instalada
try:
    import redis as _redis
    _redis_available = True
except ImportError:
    _redis = None  # type: ignore
    _redis_available = False
    logger.warning("redis_package_not_installed — cache desabilitado")


class RedisCache:
    """Cache Redis com fallback silencioso.

    Se o Redis estiver indisponível, todas as operações falham
    graciosamente retornando None/False sem lançar exceções.
    """

    def __init__(self):
        self._client: _redis.Redis | None = None if _redis_available else None
        self._enabled = settings.redis_enabled and _redis_available

    def _connect(self) -> bool:
        if self._client is not None:
            return True
        if not self._enabled or not _redis_available:
            return False
        try:
            self._client = _redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                password=settings.redis_password or None,
                socket_connect_timeout=1,
                socket_timeout=1,
                decode_responses=True,
            )
            self._client.ping()
            logger.info("redis_connected", extra={"host": settings.redis_host, "port": settings.redis_port})
            return True
        except Exception as exc:
            logger.warning("redis_connection_failed", extra={"error": str(exc)})
            self._client = None
            return False

    def get(self, key: str) -> str | None:
        if not self._connect():
            return None
        try:
            return self._client.get(key)
        except Exception as exc:
            logger.warning("redis_get_error", extra={"key": key, "error": str(exc)})
            self._client = None
            return None

    def get_json(self, key: str) -> dict | list | None:
        val = self.get(key)
        if val is None:
            return None
        try:
            return json.loads(val)
        except (json.JSONDecodeError, TypeError):
            return None

    def set(self, key: str, value: str | dict | list, ttl: int = 300) -> bool:
        if not self._connect():
            return False
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value, ensure_ascii=False)
            return bool(self._client.setex(key, ttl, value))
        except Exception as exc:
            logger.warning("redis_set_error", extra={"key": key, "error": str(exc)})
            self._client = None
            return False

    def delete(self, *keys: str) -> bool:
        if not self._connect():
            return False
        try:
            return bool(self._client.delete(*keys))
        except Exception as exc:
            logger.warning("redis_delete_error", extra={"keys": keys, "error": str(exc)})
            self._client = None
            return False

    def delete_pattern(self, pattern: str) -> bool:
        if not self._connect():
            return False
        try:
            cursor = 0
            deleted = 0
            while True:
                cursor, keys = self._client.scan(cursor=cursor, match=pattern, count=100)
                if keys:
                    deleted += self._client.delete(*keys)
                if cursor == 0:
                    break
            return deleted > 0
        except Exception as exc:
            logger.warning("redis_delete_pattern_error", extra={"pattern": pattern, "error": str(exc)})
            self._client = None
            return False


cache = RedisCache()
