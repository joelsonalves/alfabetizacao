## Context

O módulo `app/services/cache.py` foi introduzido para adicionar cache Redis às rotas de configuração, feature flags e catálogo de módulos. Ele faz `import redis` no topo do módulo e instancia `cache = RedisCache()` também no topo.

Todas as rotas que usam cache importam `from app.services.cache import cache` no topo do módulo. Isso significa que, ao importar qualquer rota, o Python executa `cache.py` inteiro — incluindo o `import redis`.

Se o pacote `redis` não estiver instalado no ambiente (ambiente local sem `pip install redis`, Docker sem rebuild, CI, etc.), o `ModuleNotFoundError` é lançado e o **backend inteiro falha ao iniciar**.

O frontend fica preso em "Carregando..." porque o `AuthContext` chama `api.auth.me()` que depende do backend estar no ar.

## Goals / Non-Goals

**Goals:**
- Impedir que a ausência do pacote `redis` quebre o startup do backend
- Manter o cache Redis funcional quando a lib estiver instalada e configurada
- Garantir fallback silencioso para "sem cache" quando a lib não estiver disponível
- Modificar apenas `cache.py` — sem alterar rotas, schemas ou modelos

**Non-Goals:**
- Não alterar a lógica de negócio do cache (TTL, conexão, get/set, invalidação)
- Não adicionar novas dependências
- Não modificar o comportamento do healthcheck ou métricas
- Não criar migrações ou alterar banco de dados

## Decisions

### 1. Import lazy com try/except

**Decisão:** Substituir `import redis` por:

```python
try:
    import redis as _redis
    _redis_available = True
except ImportError:
    _redis = None
    _redis_available = False
    logger.warning("redis_package_not_installed — cache desabilitado")
```

**Alternativa considerada:** Mover o import para dentro de cada método (get, set, delete).
**Racional:** O try/except no topo é executado uma vez, não polui cada método, e a flag `_redis_available` permite desabilitar o cache inteiro de forma limpa. O warning no logger dá visibilidade imediata de que o Redis não está disponível.

### 2. Desabilitar cache graciosamente

**Decisão:** Em `RedisCache.__init__`, usar:

```python
self._enabled = settings.redis_enabled and _redis_available
```

E em `_connect`:

```python
if not self._enabled or not _redis_available:
    return False
```

**Racional:** Quando `_redis_available = False`, todos os métodos do cache retornam `None`/`False` sem tentar conectar. O código das rotas que usa o cache já trata retorno `None` (fallback para banco de dados) — nenhuma alteração necessária nas rotas.

### 3. Type hint com `_redis.Redis | None`

**Decisão:** Manter type hints usando `_redis.Redis | None`, já que `_redis` será o módulo `redis` quando disponível ou `None` (com `type: ignore`) quando não.

**Racional:** Type hints são para desenvolvimento/documentação. Em runtime, se `_redis = None`, o cache está desabilitado e `self._client` permanece `None` — o type hint nunca é materializado.

## Risks / Trade-offs

- **Pacote redis instalado mas com erro de conexão**: O cache já trata isso — `_connect()` retorna `False` e o cache opera em modo "desligado". Nenhuma mudança necessária.
- **Type hints quebrados se `_redis = None`**: Mitigado com `# type: ignore` na atribuição. Em runtime, `self._client` só é usado via `_connect()` que retorna `False` antes.
- **Cache silenciosamente desabilitado**: O `logger.warning` na importação falha dá visibilidade. O healthcheck em `GET /api/health` já reporta `redis: "unavailable"`.
