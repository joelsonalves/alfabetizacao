## Why

O sistema de alfabetização multissensorial foi implementado com funcionalidades completas, mas carece de fundamentos arquiteturais essenciais para um sistema educacional em produção: testes automatizados, controle de concorrência, estratégia de migração de dados, observabilidade, segurança de autenticação e acessibilidade. Sem essas bases, o sistema apresenta riscos de regressão, perda de dados, falhas silenciosas e exclusão de usuários com deficiência.

## What Changes

- **Testes Automatizados**: Suite de testes unitários e de integração para backend (pytest) e frontend (Vitest + React Testing Library), mais testes e2e (Playwright) para fluxos críticos
- **Controle de Concorrência**: Mecanismo de optimistic locking no progresso do usuário para evitar sobrescrita entre abas/janelas
- **Migração de Dados**: Estratégia formal de migração com scripts Alembic versionados e plano de rollback
- **Observabilidade**: Logs estruturados (structlog), métricas de uso e health checks avançados
- **Segurança JWT**: Implementação de refresh tokens, rota de logout com blocklist, e renovação silenciosa de token
- **Acessibilidade (a11y)**: Adequação às diretrizes WCAG 2.1 nível AA, incluindo navegação por teclado, contraste, ARIA labels, e suporte a leitores de tela

## Capabilities

### New Capabilities
- `automated-testing`: Testes unitários, integração e e2e para backend e frontend
- `concurrency-control`: Optimistic locking para prevenção de sobrescrita de progresso
- `data-migration`: Estratégia versionada de migração de dados com scripts e rollback
- `observability`: Logs estruturados, métricas de uso e health checks
- `jwt-security`: Refresh tokens, logout com blocklist e renovação silenciosa
- `accessibility`: Conformidade WCAG 2.1 AA com navegação, contraste e ARIA

### Modified Capabilities
<!-- Nenhuma capability existente está sendo modificada — todas são novas -->

## Impact

- **Backend**: Novas dependências (pytest, pytest-asyncio, httpx, structlog); novos arquivos de teste em `backend/tests/`; modificação nos endpoints de auth para suporte a refresh token; modificação nos endpoints de progress para optimistic locking; configuração de logging estruturado
- **Frontend**: Novas dependências (Vitest, React Testing Library, Playwright, @axe-core/react); novos arquivos de teste em `frontend/src/tests/`; modificações em componentes para ARIA labels e navegação por teclado; novos helpers de acessibilidade
- **Banco**: Novas migrações Alembic para tabela de token blocklist e versão de linhas (optimistic locking)
- **Infra**: Novos health checks no docker-compose; configuração de formato de logs para produção
- **Nenhuma mudança breaking**: Todas as adições são complementares, sem alterar comportamento existente
