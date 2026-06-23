## Why

O módulo de cache Redis (`app/services/cache.py`) faz `import redis` no topo do arquivo. Quando o backend é iniciado, as rotas que importam o cache disparam a execução desse módulo. Se o pacote `redis` não estiver instalado no ambiente (ex: Docker sem rebuild, ambiente local sem `pip install redis`), o Python lança `ModuleNotFoundError` e **o backend não sobe**. O frontend fica preso em "Carregando..." porque as chamadas de API jamais respondem.

## What Changes

1. **`backend/app/services/cache.py`**: Substituir `import redis` por import lazy com `try/except ImportError`, definindo `_redis_available = False` se a lib não estiver presente.
2. **Ajustar `RedisCache.__init__` e `_connect`**: Usar `_redis_available` para desabilitar o cache graciosamente quando a lib não estiver instalada, em vez de quebrar o startup.
3. **Nenhuma alteração em rotas ou outros módulos** — os imports `from app.services.cache import cache` continuam funcionando porque `cache.py` não quebra mais na importação.

## Capabilities

### New Capabilities
*Nenhuma — é uma correção, não uma nova capacidade.*

### Modified Capabilities
*Nenhuma — o comportamento do cache em runtime permanece idêntico. Apenas o tratamento de falha de importação muda.*

## Impact

- **`backend/app/services/cache.py`**: Único arquivo modificado. A lógica de negócio do cache (conexão, get/set, fallback silencioso) não muda — apenas o momento em que a dependência `redis` é carregada.
- **Dependências**: `redis` continua opcional. Se instalado e configurado, o cache funciona normalmente. Se não instalado, o cache é desabilitado silenciosamente.
- **Testes**: Testes existentes do cache continuam válidos. Nenhum novo teste necessário.
