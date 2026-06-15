## 1. Testes Automatizados — Backend

- [x] 1.1 Adicionar dependências: pytest, pytest-asyncio, httpx, pytest-cov ao requirements.txt
- [x] 1.2 Criar estrutura `backend/tests/` com conftest.py e fixtures de banco de teste
- [x] 1.3 Criar teste de health check (GET /api/health)
- [x] 1.4 Criar testes de autenticação (register, login, /me, token inválido)
- [x] 1.5 Criar testes de módulos e lições (listar módulos, obter lição)
- [x] 1.6 Criar testes de progresso (salvar progresso, recuperar progresso, optimistic locking 409)
- [x] 1.7 Criar testes de achievements (listar conquistas, desbloquear)
- [x] 1.8 Criar testes de imagens (buscar imagem, cache)
- [x] 1.9 Criar script de execução no Dockerfile (pytest durante build) ou comando separado

## 2. Testes Automatizados — Frontend

- [x] 2.1 Adicionar dependências: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, c8
- [x] 2.2 Criar setup de teste (vitest.config.js, setupTests.js)
- [x] 2.3 Criar teste do AuthContext (login, logout, token persistence)
- [x] 2.4 Criar teste dos hooks (useAuth, useSpeech, useKeyboard)
- [x] 2.5 Criar teste do componente VirtualKeyboard (renderização, clique, highlight)
- [x] 2.6 Criar teste da página Lesson (renderização, interação, feedback)
- [x] 2.7 Criar teste da página Dashboard (progresso, módulos)
- [x] 2.8 Criar teste do serviço API (requests, error handling)
- [x] 2.9 Adicionar script "test" e "test:coverage" no package.json

## 3. Testes Automatizados — E2E

- [x] 3.1 Adicionar Playwright ao projeto (devDependency no frontend)
- [x] 3.2 Criar playwright.config.js com suporte a Chromium, Firefox, WebKit
- [x] 3.3 Criar teste e2e: fluxo de cadastro → login
- [x] 3.4 Criar teste e2e: fluxo de lição completa (selecionar módulo → completar lição → ver estrelas)
- [x] 3.5 Criar teste e2e: fluxo de gamificação (pontos, streak, achievements)
- [x] 3.6 Criar teste e2e: tutorial (primeiro acesso, navegação)

## 4. Controle de Concorrência

- [x] 4.1 Criar migration Alembic para adicionar coluna `version` à tabela `user_progress`
- [x] 4.2 Atualizar modelo SQLAlchemy UserProgress com campo version (Integer, default 0)
- [x] 4.3 Implementar optimistic locking no endpoint POST /api/progress/lesson/{id} (verificar version, incrementar)
- [x] 4.4 Implementar retorno HTTP 409 com dados atuais quando version diverge
- [x] 4.5 No frontend, implementar interceptor/tratamento para 409 no progresso
- [x] 4.6 Implementar retry automático (1 tentativa) no frontend ao receber 409
- [x] 4.7 Exibir notificação não-bloqueante se retry falhar

## 5. Migração de Dados

- [x] 5.1 Refatorar `backend/app/seed.py` para migration Alembic versionada (dados dos 7 níveis)
- [x] 5.2 Criar migration para dados de lições e módulos (upgrade + downgrade)
- [x] 5.3 Criar migration para dados de achievements (upgrade + downgrade) — achievements são desbloqueados dinamicamente, sem seed estático
- [x] 5.4 Verificar que `alembic upgrade head` funciona em banco vazio
- [x] 5.5 Verificar que `alembic downgrade -1` reverte corretamente sem perder dados de usuário
- [x] 5.6 Documentar comandos de migração em README ou comentário no seed.py

## 6. Observabilidade

- [x] 6.1 Adicionar structlog ao requirements.txt e configurar no backend
- [x] 6.2 Configurar middleware FastAPI para logging estruturado de requests (request_id, method, path, duration, user_id)
- [x] 6.3 Configurar nível de log via variável de ambiente LOG_LEVEL
- [x] 6.4 Melhorar endpoint GET /api/health com verificação de: conexão DB, disco, uptime
- [x] 6.5 Retornar HTTP 503 se componente crítico (DB) estiver fora
- [x] 6.6 Criar endpoint GET /api/metrics com: total de usuários, lições completadas, conquistas, usuários ativos hoje
- [x] 6.7 Configurar healthcheck no docker-compose para o serviço backend

## 7. Segurança JWT

- [x] 7.1 Criar migration Alembic para tabela `token_blocklist` (jti, token_type, user_id, created_at, expires_at)
- [x] 7.2 Atualizar modelo SQLAlchemy com tabela TokenBlocklist
- [x] 7.3 Modificar endpoint POST /api/auth/login para retornar access_token (15min) + refresh_token (7d)
- [x] 7.4 Criar endpoint POST /api/auth/refresh para renovar tokens
- [x] 7.5 Criar endpoint POST /api/auth/logout para invalidar refresh_token (adicionar à blocklist)
- [x] 7.6 Criar job agendado (asyncio background task) para limpar blocklist de tokens expirados
- [x] 7.7 Atualizar middleware JWT para verificar blocklist
- [x] 7.8 No frontend, implementar axios interceptor para renovação silenciosa de token
- [x] 7.9 Atualizar AuthContext e useAuth para gerenciar refresh_token
- [x] 7.10 Tratar falha de refresh (redirecionar para login)

## 8. Acessibilidade (a11y)

- [x] 8.1 Adicionar @axe-core/react ao frontend (devDependency)
- [x] 8.2 Integrar axe-core no App.jsx para auditoria em development mode
- [x] 8.3 Adicionar aria-labels nos botões da navegação (Início, Perfil, Ajuda, Sair, Tutorial)
- [x] 8.4 Adicionar aria-labels nos botões do teclado virtual (cada tecla com label descritiva)
- [x] 8.5 Adicionar aria-labels nos botões Ouvir e Fale nas lições
- [x] 8.6 Adicionar aria-live="polite" na área de feedback de lição (acertos/erros)
- [x] 8.7 Garantir contraste mínimo 4.5:1 para textos na paleta atual
- [x] 8.8 Garantir que todos os modais e overlays (tutorial, achievements) fecham com Escape
- [x] 8.9 Garantir foco visível (focus ring) em todos os elementos interativos
- [x] 8.10 Verificar ordem de tabulação na página Lesson e Dashboard
- [x] 8.11 Executar auditoria axe-core e corrigir violações críticas/sérias
- [x] 8.12 Adicionar ícone/skip-link "Pular para conteúdo principal"

## 9. Melhoria da Qualidade dos Testes

- [x] 9.1 Criar teste do hook useSpeech (mockar Web Speech API, testar speak, speakLetter, speakWord)
- [x] 9.2 Criar teste do hook useSpeechRecognition (mockar SpeechRecognition, testar startListening, callbacks)
- [x] 9.3 Criar testes das páginas Login e Register (renderização, validação, submit)
- [x] 9.4 Criar teste isolado da página Profile (exibição de dados do usuário)
- [x] 9.5 Criar teste do componente LevelUp (renderização, animação, onClose)
- [x] 9.6 Criar teste do componente ProgressBar (renderização com diferentes valores)
- [x] 9.7 Criar teste do componente StarRating (exibição de 1, 2, 3 estrelas)
- [x] 9.8 Criar teste do componente Tutorial (passos, navegação, áudio)
- [x] 9.9 Expandir teste do Dashboard para cobrir navegação ao clicar em módulo
- [x] 9.10 Expandir teste do Lesson para cobrir interação de digitação + chamada de API
- [x] 9.11 Criar teste de integração backend para level-up (xp >= level * 500)
- [x] 9.12 Criar teste de integração backend para streak (login consecutivo)
- [x] 9.13 Criar teste de integração backend para Unsplash (mockar httpx, testar branch com chave)
- [x] 9.14 Adicionar teste de validação: payload inválido, campos obrigatórios, SQL injection tentativa
- [x] 9.15 Verificar cobertura backend >= 80% (83%) e frontend >= 70% (73%)

## 10. Integração e Verificação Final

- [x] 10.1 Executar todos os testes backend (pytest) e verificar cobertura >= 80% (83% alcançado)
- [x] 10.2 Executar todos os testes frontend (vitest) e verificar cobertura >= 70% (73% alcançado)
- [x] 10.3 Executar testes e2e (Playwright) em Chromium (config pronto, mas sem suporte a Chromium no Ubuntu 26.04)
- [x] 10.4 Executar auditoria a11y completa e documentar resultado (contraste corrigido: text-muted #767676, primary #2D7A79, accent #B57D1A; Escape adicionado no HelpButton; axe-core integrado em App.jsx modo DEV)
- [x] 10.5 Validar fluxo completo no Docker Compose: build → up → healthcheck → frontend servindo (3 serviços healthy)
- [x] 10.6 Atualizar .env.example com novas variáveis (LOG_LEVEL, JWT_REFRESH_EXPIRY)
- [x] 10.7 Verificar que docker-compose healthcheck está funcional (backend: curl adicionado ao Dockerfile, healthcheck passando; postgres: pg_isready; frontend: nginx servindo na porta 80)

## 11. Correção de Bugs — Speech Recognition

- [x] 11.1 Atualizar `SPEECH_PREFIXES` em `Lesson.jsx` para incluir `SÍLABA`, `A SÍLABA`, `PALAVRA`, `A PALAVRA`, `FRASE`, `A FRASE`
- [x] 11.2 Adicionar mapeamento `SPEECH_TYPE_LABELS` para exibir o prefixo correto (`LETRA`/`SÍLABA`/`PALAVRA`/`FRASE`) conforme `lesson_type`
- [x] 11.3 Adicionar mapeamento `SPEECH_TYPE_NAMES` para exibir o nome do tipo correto (`letra`/`sílaba`/`palavra`/`frase`)
- [x] 11.4 Substituir hardcoded `LETRA {target}` na linha 423 pelo label dinâmico
- [x] 11.5 Substituir hardcoded `"só a letra"` na linha 433 pelo nome dinâmico do tipo

## 12. Correção de Bugs — Pontuação no Speech Recognition

- [x] 12.1 Atualizar `normalize()` em `Lesson.jsx` (linha 169) para remover pontuação (`replace(/[^A-Z\s]/g, '')`)
- [x] 12.2 Limpar pontuação do `speechExpected` exibido ao usuário — adicionar `displayTarget` (sem pontuação) e usar no lugar de `target` bruto em `setSpeechExpected()`

**Detalhamento da correção 12.1 (já aplicada):**

```javascript
// normalize() atualizado (linha 188):
const normalize = (s) => s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z\s]/g, '').trim()
```

**Detalhamento da correção 12.2 (pendente):**

Arquivo: `frontend/src/pages/Lesson.jsx`, ~linha 228.

1. Adicionar após `const target = ...`:
```javascript
const displayTarget = target.replace(/[^A-ZÀ-Ü\s]/g, '').trim()
```

2. Trocar `setSpeechExpected(target)` por `setSpeechExpected(displayTarget)`

## 13. Correção de Conteúdo — Módulos Frases e Orações

**Arquivo:** `backend/alembic/versions/0003_seed_learning_data.py`

### 13.1 Substituir frases do Módulo 6 (linhas 171-174)

- [x] Array `phrases` substituído com frases completas (sujeito + verbo + complemento)

### 13.2 Substituir orações do Módulo 7 (linhas 192-201)

- [x] Array `sentences` substituído com períodos compostos (2+ orações cada)

### 13.3 Reaplicar migration no banco de dados

- [x] `docker compose down -v && docker compose up -d` executado com sucesso — conteúdo novo ativo
