# Redis como Camada de Cache

Adicionar Redis ao projeto como cache intermediário entre a API e o PostgreSQL, reduzindo latência em dados de leitura frequente e baixa taxa de alteração (configurações, regras, catálogos).

---

## Fase 1: Infraestrutura Redis

### Problema

Atualmente **toda requisição** consulta o PostgreSQL diretamente, mesmo para dados que:
- Mudam raramente (ex: `scoring_rules`, `achievement_definitions`, `feature_flags`)
- São idênticos para todos os usuários (ex: catálogo de emojis, módulos de lição)
- São consultados em **toda inicialização de lição** (ex: `GET /api/scoring-rules`, `GET /api/modules/{id}/lessons`)

Isso gera:
- Conexões desnecessárias ao banco para dados estáticos
- Latência adicional em cada carregamento de lição (~20-50ms por query)
- Escalabilidade limitada: cada requisição no pico gera N queries no PostgreSQL

### Solução

Adicionar Redis 7-alpine como serviço no Docker Compose e criar módulo de cache no backend com:
- Conexão via `redis-py` com fallback transparente (cache indisponível → consulta ao banco)
- TTL configurável por tipo de dado (5min para config, 1h para catálogo)
- Invalidação manual via hook nas rotas de escrita (PUT/DELETE admin)

#### Added Requirements

##### Requirement: Serviço Redis no Docker Compose

O arquivo `docker-compose.yml` DEVE conter um serviço `redis` com:
- Imagem `redis:7-alpine`
- Container name `alfabetizacao-cache`
- Porta `6379`
- Healthcheck com `redis-cli ping`
- Volume nomeado `redis_data` para persistência
- Dependente do serviço `backend` (não o contrário — backend funciona sem Redis)

##### Scenario: Redis healthcheck

- **GIVEN** o serviço redis em execução
- **WHEN** `docker compose exec redis redis-cli ping` é executado
- **THEN** DEVE retornar `PONG`

##### Requirement: Configuração Redis no Settings

`backend/app/config.py` DEVE ter os seguintes campos:

```python
redis_host: str = "localhost"
redis_port: int = 6379
redis_db: int = 0
redis_password: str = ""
redis_ttl_config: int = 300       # 5 min para dados de configuração
redis_ttl_catalog: int = 3600     # 1 h para catálogos
redis_enabled: bool = True
```

Todos com suporte a variáveis de ambiente (`REDIS_HOST`, `REDIS_PORT`, etc.).

##### Scenario: Variáveis de ambiente Redis

- **GIVEN** o container backend com `REDIS_HOST=redis`
- **WHEN** `settings.redis_host` é acessado
- **THEN** DEVE retornar `"redis"`

##### Requirement: Módulo de cache com fallback

`backend/app/services/cache.py` DEVE implementar:

```python
class RedisCache:
    def __init__(self):
        self._client: redis.Redis | None = None
        self._enabled = settings.redis_enabled

    def _connect(self) -> bool:
        # Tenta conectar ao Redis. Se falhar, retorna False.

    def get(self, key: str) -> str | None:
        # Retorna valor do cache ou None (miss ou Redis indisponível)

    def set(self, key: str, value: str, ttl: int = 300) -> bool:
        # Armazena valor com TTL. Retorna False se Redis indisponível.

    def delete(self, *keys: str) -> bool:
        # Invalida uma ou mais chaves.

    def delete_pattern(self, pattern: str) -> bool:
        # Invalida todas as chaves que correspondem ao padrão (ex: "scoring:*")
```

O cache DEVE ser um singleton compartilhado pela aplicação.

**IMPORTANTE:** Toda operação DEVE ter fallback silencioso — se Redis estiver offline, o sistema continua funcionando consultando o banco diretamente, sem lançar exceções.

##### Scenario: Cache miss com Redis offline

- **GIVEN** Redis está offline
- **WHEN** `cache.get("scoring:letter")` é chamado
- **THEN** DEVE retornar `None`
- **AND** NÃO DEVE lançar exceção
- **AND** o caller DEVE consultar o banco como fallback

##### Scenario: Cache hit

- **GIVEN** Redis está online e contém `cache.set("scoring:letter", '{"value":"10"}', ttl=300)`
- **WHEN** `cache.get("scoring:letter")` é chamado
- **THEN** DEVE retornar `'{"value":"10"}'`

#### Implementation

##### Docker Compose

Adicionar ao final do arquivo `docker-compose.yml`, após o serviço `frontend`:

```yaml
  redis:
    image: redis:7-alpine
    container_name: alfabetizacao-cache
    restart: unless-stopped
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:   # <-- adicionar redis_data aqui
```

##### Dependência

Adicionar `redis>=5.0` ao `backend/requirements.txt`:

```
redis==5.2.1
```

##### Config

`backend/app/config.py` — adicionar ao `Settings`:

```python
redis_host: str = "localhost"
redis_port: int = 6379
redis_db: int = 0
redis_password: str = ""
redis_ttl_config: int = 300
redis_ttl_catalog: int = 3600
redis_enabled: bool = True
```

##### Módulo de cache

Criar `backend/app/services/cache.py`:

```python
import json
import logging
import redis
from app.config import settings

logger = logging.getLogger(__name__)


class RedisCache:
    """Cache Redis com fallback silencioso.

    Se o Redis estiver indisponível, todas as operações falham
    graciosamente retornando None/False sem lançar exceções.
    """

    def __init__(self):
        self._client: redis.Redis | None = None
        self._enabled = settings.redis_enabled

    def _connect(self) -> bool:
        if self._client is not None:
            return True
        if not self._enabled:
            return False
        try:
            self._client = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                password=settings.redis_password or None,
                socket_connect_timeout=1,
                socket_timeout=1,
                decode_responses=True,
            )
            self._client.ping()
            logger.info("redis_connected", host=settings.redis_host, port=settings.redis_port)
            return True
        except Exception as exc:
            logger.warning("redis_connection_failed", error=str(exc))
            self._client = None
            return False

    def get(self, key: str) -> str | None:
        if not self._connect():
            return None
        try:
            return self._client.get(key)
        except Exception as exc:
            logger.warning("redis_get_error", key=key, error=str(exc))
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
            logger.warning("redis_set_error", key=key, error=str(exc))
            self._client = None
            return False

    def delete(self, *keys: str) -> bool:
        if not self._connect():
            return False
        try:
            return bool(self._client.delete(*keys))
        except Exception as exc:
            logger.warning("redis_delete_error", keys=keys, error=str(exc))
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
            logger.warning("redis_delete_pattern_error", pattern=pattern, error=str(exc))
            self._client = None
            return False


# Singleton compartilhado
cache = RedisCache()
```

---

## Fase 2: Cache de Dados de Configuração

### Problema

As rotas de configuração (`GET /api/scoring-rules`, `GET /api/feature-flags`) são chamadas **em toda inicialização de lição** e retornam dados que quase nunca mudam (só alteram via admin). Cada chamada faz uma query SQL.

### Solução

Adicionar cache nas rotas de leitura com padrão:
1. **Read**: verificar cache → se hit, retornar → se miss, consultar BD, armazenar em cache, retornar
2. **Write**: executar operação no BD + invalidar chave(s) de cache relacionada(s)

#### Added Requirements

##### Requirement: Cache em GET /api/scoring-rules

`GET /api/scoring-rules` DEVE:
1. Tentar `cache.get("scoring:all")` primeiro
2. Se cache hit, retornar dados do cache
3. Se cache miss, consultar BD, então `cache.set("scoring:all", dados, ttl=settings.redis_ttl_config)`

##### Scenario: Scoring rules em cache

- **GIVEN** cache Redis contém `scoring:all` com dados válidos
- **WHEN** `GET /api/scoring-rules` é chamado
- **THEN** NÃO DEVE executar query SQL
- **AND** DEVE retornar os dados do cache

##### Requirement: Invalidação em PUT /api/admin/scoring-rules/{rule_key}

`PUT /api/admin/scoring-rules/{rule_key}` DEVE, após atualizar o BD, chamar `cache.delete("scoring:all")`.

##### Scenario: Invalida ao atualizar regra

- **GIVEN** cache contém `scoring:all`
- **WHEN** `PUT /api/admin/scoring-rules/points_letter` é chamado
- **THEN** DEVE invalidar `scoring:all`
- **AND** a próxima `GET /api/scoring-rules` DEVE consultar o BD e re-popular o cache

##### Requirement: Cache em GET /api/feature-flags

Mesmo padrão do scoring-rules, com chave `feature_flags:all` e TTL de 300s.

##### Requirement: Cache em GET /api/modules

`GET /api/modules` DEVE usar cache com chave `modules:all` e TTL de 3600s (1 hora — módulos só mudam via seed/admin).

#### Implementation

**Arquivo:** `backend/app/routes/config.py`

```python
from app.services.cache import cache

@router.get("/scoring-rules", response_model=list[ScoringRuleResponse])
def list_scoring_rules(lesson_type: str | None = None, db: Session = Depends(get_db)):
    cached = cache.get_json("scoring:all")
    if cached is not None:
        data = [ScoringRuleResponse(**item) for item in cached]
        if lesson_type:
            data = [
                r for r in data
                if r.active and (r.lesson_type == lesson_type or r.lesson_type is None)
            ]
        return data
    # ... existing query ...
    q = db.query(ScoringRule).filter(ScoringRule.active == True)
    if lesson_type:
        q = q.filter((ScoringRule.lesson_type == lesson_type) | (ScoringRule.lesson_type.is_(None)))
    rules = q.all()
    cache.set("scoring:all", [ScoringRuleResponse.model_validate(r).model_dump() for r in rules], ttl=settings.redis_ttl_config)
    return rules
```

Para a rota PUT, adicionar após `db.commit()`:

```python
cache.delete("scoring:all")
```

**Arquivo:** `backend/app/routes/feature_flags.py`

```python
from app.services.cache import cache

@router.get("", response_model=list[FeatureFlagResponse])
def list_feature_flags(_user=Depends(get_current_user), db: Session = Depends(get_db)):
    cached = cache.get_json("feature_flags:all")
    if cached is not None:
        return [FeatureFlagResponse(**item) for item in cached]
    flags = db.query(FeatureFlag).order_by(FeatureFlag.key).all()
    cache.set("feature_flags:all", [FeatureFlagResponse.model_validate(f).model_dump() for f in flags], ttl=settings.redis_ttl_config)
    return flags
```

**Arquivo:** `backend/app/routes/modules.py`

```python
from app.services.cache import cache

@router.get("", response_model=list[ModuleResponse])
def list_modules(db: Session = Depends(get_db)):
    cached = cache.get_json("modules:all")
    if cached is not None:
        return [ModuleResponse(**item) for item in cached]
    modules = db.query(LearningModule).order_by(LearningModule.sort_order).all()
    cache.set("modules:all", [ModuleResponse.model_validate(m).model_dump() for m in modules], ttl=settings.redis_ttl_catalog)
    return modules
```

---

## Fase 3: Cache de Catálogo e Emojis

### Problema

Os dicionários `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, `WORD_EMOJI_MAP` e `EMOJI_CATALOG` em `images.py` são carregados **em memória** a cada import — não há consulta ao BD aqui. No entanto, o `GET /api/admin/emoji-mappings` consulta `emoji_mappings` no BD e monta a resposta montando os dicionários + catálogo. Esta rota é chamada sempre que o admin abre o gerenciador de emojis.

### Solução

Cachear a resposta da rota `GET /api/admin/emoji-mappings` com chave `admin:emoji-mappings` e TTL de 300s. Invalidar nas rotas de escrita (POST/PUT/DELETE de emoji-mappings).

#### Added Requirements

##### Requirement: Cache em GET /api/admin/emoji-mappings

A rota DEVE usar cache com chave `admin:emoji-mappings`.

##### Scenario: Admin emoji cache hit

- **GIVEN** cache contém `admin:emoji-mappings`
- **WHEN** `GET /api/admin/emoji-mappings` é chamado
- **THEN** DEVE retornar dados do cache sem consultar BD

##### Requirement: Invalidação em POST/PUT/DELETE emoji-mappings

As rotas de escrita DEVM chamar `cache.delete("admin:emoji-mappings")` após cada operação.

#### Implementation

**Arquivo:** `backend/app/routes/admin_content.py`

Adicionar cache na rota `GET /emoji-mappings` e invalidar nas rotas de escrita.

---

## Fase 4: Healthcheck e Métricas com Redis

### Problema

O healthcheck atual (`GET /api/health`) só verifica o banco. Com Redis no stack, o healthcheck deve refletir o estado de todos os serviços.

### Solução

Adicionar status do Redis ao healthcheck e às métricas.

#### Added Requirements

##### Requirement: Healthcheck inclui Redis

`GET /api/health` DEVE incluir campo `redis` com valor `"ok"` ou `"unavailable"`.

##### Scenario: Healthcheck com Redis online

- **GIVEN** Redis está online
- **WHEN** `GET /api/health` é chamado
- **THEN** `redis` DEVE ser `"ok"`

##### Scenario: Healthcheck com Redis offline

- **GIVEN** Redis está offline
- **WHEN** `GET /api/health` é chamado
- **THEN** `redis` DEVE ser `"unavailable"`
- **AND** `status` DEVE ser `"ok"` (Redis não é crítico)

#### Implementation

**Arquivo:** `backend/app/main.py`

```python
@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    from app.services.cache import cache
    
    # DB status
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    # Redis status
    redis_status = "ok" if cache._connect() else "unavailable"

    if db_status == "error":
        raise HTTPException(status_code=503, detail="Database connection failed")

    return {
        "status": "ok",
        "service": "alfabetizacao-multissensorial",
        "database": db_status,
        "redis": redis_status,
        "uptime_seconds": int(time.time() - START_TIME),
    }
```

---

## Variáveis de Ambiente

| Variável | Default | Descrição |
|----------|---------|-----------|
| `REDIS_HOST` | `localhost` | Host do Redis |
| `REDIS_PORT` | `6379` | Porta do Redis |
| `REDIS_DB` | `0` | Database Redis |
| `REDIS_PASSWORD` | `""` | Senha Redis |
| `REDIS_TTL_CONFIG` | `300` | TTL para dados de configuração (s) |
| `REDIS_TTL_CATALOG` | `3600` | TTL para catálogos (s) |
| `REDIS_ENABLED` | `True` | Liga/desliga cache |

Adicionar ao `docker-compose.yml` no serviço `backend`:

```yaml
    environment:
      # ... existing vars ...
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_ENABLED: "true"
```

---

## Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `docker-compose.yml` | Adicionar serviço `redis` + `redis_data` volume |
| `backend/requirements.txt` | Adicionar `redis==5.2.1` |
| `backend/app/config.py` | Adicionar campos Redis ao `Settings` |
| `backend/app/services/cache.py` | **Criar** — módulo `RedisCache` |
| `backend/app/main.py` | Adicionar Redis ao healthcheck |
| `backend/app/routes/config.py` | Adicionar cache nas rotas de scoring-rules e achievements |
| `backend/app/routes/feature_flags.py` | Adicionar cache |
| `backend/app/routes/modules.py` | Adicionar cache |
| `backend/app/routes/admin_content.py` | Adicionar cache + invalidação nas rotas de emoji |

---

## Testes

### Teste de Unidade (sugerido)

```python
# tests/test_cache.py
from app.services.cache import RedisCache


def test_cache_offline_returns_none():
    cache = RedisCache()
    cache._enabled = False
    assert cache.get("any_key") is None
    assert cache.set("any_key", "value") is False


def test_cache_get_json_none_on_miss():
    cache = RedisCache()
    cache._enabled = False
    assert cache.get_json("any_key") is None


def test_cache_delete_pattern_offline():
    cache = RedisCache()
    cache._enabled = False
    assert cache.delete_pattern("test:*") is False
```

### Teste de Integração (sugerido, com Redis mock ou real)

```python
# tests/test_cache_integration.py
def test_scoring_rules_cache_hit(client, admin_headers, mocker):
    from app.services.cache import cache
    mock_data = [{"rule_key": "points_letter", "value": "10", "active": True}]
    mocker.patch.object(cache, "get_json", return_value=mock_data)
    spy = mocker.patch("app.routes.config.db.query")  # não deve ser chamado

    resp = client.get("/api/scoring-rules", headers=admin_headers)
    assert resp.status_code == 200
    spy.assert_not_called()
```

---

## Notas

- **Redis não é obrigatório**: o sistema funciona perfeitamente sem ele. Cache é uma otimização transparente.
- **TTL conservador**: 5min para config permite que dados fiquem desatualizados por no máximo 5 minutos após alteração via admin.
- **Invalidação manual**: toda rota de escrita admin invalida o cache explicitamente. Não há TTL curto o suficiente para substituir invalidação correta.
- **Singleton**: o `RedisCache` é compartilhado por toda a aplicação. A conexão é lazy (só acontece na primeira operação).
- **Decode responses**: `decode_responses=True` no cliente Redis para trabalhar com strings Python, não bytes.
