## Context

O projeto Alfabetização Multissensorial utiliza:
- **Backend**: pytest + pytest-asyncio + httpx (AsyncClient) para testes de integração com banco SQLite in-memory
- **Frontend**: Vitest + React Testing Library + jsdom para testes unitários; Playwright para e2e
- **Fixtures**: `conftest.py` fornece `client`, `db_session`, `test_user`, `auth_token`, `auth_headers`

A cobertura atual é ~83% backend e ~73% frontend. A meta é atingir ~90% backend e ~85% frontend sem alterar código de produção — apenas adicionando testes.

## Goals / Non-Goals

**Goals:**
- Adicionar 12 testes backend para serviços e fluxos de erro não cobertos
- Adicionar 20 testes frontend para componentes e edge cases não cobertos
- Manter compatibilidade total com testes existentes (sem regressões)
- Cobertura estimada: backend ~90%, frontend ~85%

**Non-Goals:**
- Não alterar código de produção (nenhuma linha de `app/` ou `src/pages|components|hooks|services|context` será modificada)
- Não adicionar novas dependências
- Não criar testes e2e (Playwright) — estes exigem ambiente Docker com banco de dados
- Não refatorar testes existentes

## Decisions

### 1. Organização dos testes por funcionalidade
Cada arquivo de teste cobre uma área específica (`test_cleanup.py`, `test_layout.py`, etc.), mesma convenção já adotada no projeto. Isso mantém a descoberta automática do pytest (`test_*.py`) e do Vitest (`*.test.*`).

### 2. Backend: uso de fixtures existentes
Todos os testes backend reaproveitam fixtures de `conftest.py` (`client`, `db_session`, `auth_headers`) para evitar duplicação de setup. Para testes de token expirado, serão usados `datetime` manipulados ou tokens criados manualmente.

### 3. Frontend: mocks isolados por teste
Cada arquivo de teste mocka apenas as dependências necessárias (serviços, hooks), seguindo o padrão já usado em `Lesson.test.jsx` e `Dashboard.test.jsx`. Componentes sem cobertura (Layout, HelpButton, ImageDisplay) terão mocks mínimos de `useAuth`/`useNavigate`.

### 4. Sem alteração em `vitest.config.js` ou `pyproject.toml`
A configuração de teste existente já cobre os padrões de descoberta de novos arquivos. Apenas adicionar os arquivos na estrutura de diretórios existente é suficiente.

## Risks / Trade-offs

- [Testes de token expirado] → Dependem de manipulação de tempo. Mitigação: usar `datetime` mockado ou criar token com `exp` no passado manualmente via `jwt.encode`.
- [Testes de async cleanup] → `clean_expired_blocklist()` é um loop infinito. Mitigação: testar apenas a lógica interna (a query SQL) em vez do loop em si, usando `clean_expired_blocklist_sync`.
- [Testes de Layout/App] → Dependem de `react-router-dom` (Navigate, useLocation). Mitigação: usar `MemoryRouter` com rotas controladas, mesmo padrão dos testes existentes.
