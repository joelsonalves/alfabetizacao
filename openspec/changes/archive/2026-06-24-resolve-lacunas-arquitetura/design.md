## Context

O sistema de alfabetização multissensorial foi construído como um MVP funcional com 7 níveis de aprendizado, autenticação JWT básica, gamificação e integração TTS/ASR. A implementação priorizou features sobre fundamentos arquiteturais. Esta mudança endereça as 6 lacunas identificadas na análise de arquitetura, preparando o sistema para uso em produção com qualidade, segurança e inclusão.

**Stack atual:** FastAPI + SQLAlchemy + PostgreSQL (backend), React + Vite (frontend), Docker Compose (infra).

## Goals / Non-Goals

**Goals:**
- Suite completa de testes automatizados (unitários, integração, e2e) para backend e frontend
- Controle de concorrência no progresso do usuário via optimistic locking
- Estratégia formal de migração de dados com scripts versionados e rollback
- Logs estruturados, health checks avançados e métricas básicas de uso
- Fluxo JWT completo com refresh tokens, logout e renovação silenciosa
- Conformidade com WCAG 2.1 nível AA em toda a interface

**Non-Goals:**
- Testes de carga/performance (deixar para fase de escalabilidade)
- Dashboard de métricas em tempo real (apenas coleta e exposição via endpoint)
- Suporte multilíngue para acessibilidade (apenas PT-BR, foco em leitores de tela PT-BR)
- Certificação formal WCAG (apenas adequação técnica, sem auditoria terceirizada)
- Monitoramento distribuído/tracing (apenas logs estruturados e health checks)
- CI/CD automatizado (apenas configuração local dos testes)

## Decisions

### 1. Testes Automatizados

| Decisão | Alternativas Consideradas | Justificativa |
|---|---|---|
| **pytest + pytest-asyncio + httpx** para backend | unittest, nose2 | pytest é padrão da comunidade Python, suporta async nativo com pytest-asyncio, httpx para testes de API async |
| **Vitest + React Testing Library** para frontend | Jest, Cypress | Vitest é nativo Vite (mesma toolchain), mais rápido que Jest. RTL foca em testar comportamento do usuário |
| **Playwright** para testes e2e | Cypress, Selenium | Playwright suporta múltiplos navegadores, é mais rápido e confiável que Cypress, tem suporte nativo a mobile |
| **Estrutura:** `backend/tests/` e `frontend/src/tests/` | testes separados por repositório | Mantém simplicidade do monorepo, facilita execução local |

### 2. Controle de Concorrência

| Decisão | Alternativas Consideradas | Justificativa |
|---|---|---|
| **Optimistic locking** com coluna `version` no `UserProgress` | Pessimistic locking, fila de escrita | Optimistic é mais leve para cenário de leitura-heavy (pouca contenção). Coluna version evita locks de banco |
| **HTTP 409 Conflict** em caso de versão divergente | Mesclagem automática, último vence | 409 dá visibilidade ao frontend para re-exibir estado atual. "Último vence" pode perder progresso |
| **Retry automático** no frontend (1 tentativa) | Resolução manual pelo usuário | UX educacional não deve frustrar. Frontend tenta novamente com dados atualizados |

### 3. Migração de Dados

| Decisão | Alternativas Consideradas | Justificativa |
|---|---|---|
| **Alembic revision** com scripts `upgrade()`/`downgrade()` | Migração manual SQL, ferramentas externas | Alembic já está configurado no projeto. Scripts versionados garantem rastreabilidade |
| **Seed data versionada** no mesmo script | Seeds avulsos | Seeds atrelados à migração garantem consistência. Seeds atuais em `seed.py` serão refatorados para migração |
| **Rollback testado** em ambiente de staging | Apenas upgrade forward | Toda migration deve ter downgrade funcional para permitir rollback rápido |

### 4. Observabilidade

| Decisão | Alternativas Consideradas | Justificativa |
|---|---|---|
| **structlog** para logs estruturados | logging padrão, loguru | structlog produz JSON estruturado, facilita integração com ferramentas de logging (ELK, Datadog). Zero novas dependências pesadas |
| **Health checks avançados** (DB + TTS API + disco) | Apenas health básico | Docker depende de health checks. Incluir verificação de dependências críticas (banco, cache de imagens) |
| **Métricas via endpoint `/api/metrics`** | Prometheus client, OpenTelemetry | Endpoint simples sem dependência externa. Futuramente substituível por Prometheus |

### 5. Segurança JWT

| Decisão | Alternativas Consideradas | Justificativa |
|---|---|---|
| **Refresh token** com 7 dias de expiry | Sessão server-side (Redis), JWT de longa duração | Refresh token permite revogação sem estado server-side pesado. 7 dias equilibra segurança e UX |
| **Blocklist** em tabela PostgreSQL | Redis, blacklist em memória | PostgreSQL já disponível, sem infra extra. Blocklist é limpa periodicamente por job agendado |
| **Renovação silenciosa** via axios interceptor | Renovação manual (redirect para login) | Interceptor no frontend renova token automaticamente sem interromper fluxo do usuário |
| **Rota `POST /api/auth/logout`** que invalida refresh token | Apenas deletar token no cliente | Logout server-side garante que token não pode ser reutilizado mesmo se vazado |

### 6. Acessibilidade (a11y)

| Decisão | Alternativas Consideradas | Justificativa |
|---|---|---|
| **WCAG 2.1 nível AA** como alvo | WCAG 2.1 AAA, Section 508 | AA é o padrão legal brasileiro (Lei Brasileira de Inclusão). AAA é inviável sem auditoria profissional |
| **@axe-core/react** para auditoria automatizada | Lighthouse CI, WAVE | axe-core é padrão da indústria, integra com React Testing Library, detecta ~57% dos problemas de a11y |
| **ARIA labels descritivas** em todos os componentes interativos | Atributos aria-label mínimos | Público de alfabetização se beneficia de labels descritivos que explicam o elemento |
| **Navegação por teclado completa** (Tab, Enter, Escape, setas) | Apenas Tab para foco | Teclado é central no sistema (digitação). Navegação completa é obrigatória |

## Risks / Trade-offs

- [Performance dos testes e2e] → Playwright é rápido mas testes e2e aumentam tempo de CI. Mitigação: testes e2e apenas para fluxos críticos (cadastro → login → lição → gamificação)
- [Optimistic locking pode gerar 409 em uso intenso] → Cenário de baixa contenção (usuário individual). Se surgirem conflitos frequentes, migrar para pessimistic locking futuramente
- [structlog adiciona latência mínima] → ~0.1ms por entrada de log. Aceitável para o volume esperado
- [Refresh token blocklist cresce com o tempo] → Job diário de limpeza de tokens expirados. Tabela indexada por expiry
- [Acessibilidade manual trabalhosa] → axe-core automatiza detecção. Revisão manual focada em fluxos críticos. Estima-se 20-30% de aumento no tempo de implementação de componentes
- [Testes podem quebrar com mudanças de layout] → RTL foca em comportamento, não em implementação. Testes e2e usam data-testid para isolamento
