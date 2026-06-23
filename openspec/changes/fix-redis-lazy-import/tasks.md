## 1. Corrigir import do Redis em cache.py

- [x] 1.1 Substituir `import redis` por `try/except ImportError` com flag `_redis_available`
- [x] 1.2 Atualizar `RedisCache.__init__` para usar `_redis_available` no `self._enabled`
- [x] 1.3 Atualizar `RedisCache._connect` para checar `_redis_available` antes de conectar
- [x] 1.4 Ajustar type hints de `redis.Redis` para `_redis.Redis`

## 2. Verificar e reiniciar o backend

- [x] 2.1 Instalar pacote `redis` com `pip install redis` (ou rebuild do Docker)
- [x] 2.2 Reiniciar o backend e confirmar que o healthcheck responde em `GET /api/health`
- [x] 2.3 Verificar que o frontend carrega sem "Carregando..." eterno
- [x] 2.4 Testar que rotas com cache funcionam sem Redis (cache desabilitado silenciosamente)
