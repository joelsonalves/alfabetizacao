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

- [ ] 6.1 Adicionar structlog ao requirements.txt e configurar no backend
- [ ] 6.2 Configurar middleware FastAPI para logging estruturado de requests (request_id, method, path, duration, user_id)
- [ ] 6.3 Configurar nível de log via variável de ambiente LOG_LEVEL
- [ ] 6.4 Melhorar endpoint GET /api/health com verificação de: conexão DB, disco, uptime
- [ ] 6.5 Retornar HTTP 503 se componente crítico (DB) estiver fora
- [ ] 6.6 Criar endpoint GET /api/metrics com: total de usuários, lições completadas, conquistas, usuários ativos hoje
- [ ] 6.7 Configurar healthcheck no docker-compose para o serviço backend

## 7. Segurança JWT

- [ ] 7.1 Criar migration Alembic para tabela `token_blocklist` (jti, token_type, user_id, created_at, expires_at)
- [ ] 7.2 Atualizar modelo SQLAlchemy com tabela TokenBlocklist
- [ ] 7.3 Modificar endpoint POST /api/auth/login para retornar access_token (15min) + refresh_token (7d)
- [ ] 7.4 Criar endpoint POST /api/auth/refresh para renovar tokens
- [ ] 7.5 Criar endpoint POST /api/auth/logout para invalidar refresh_token (adicionar à blocklist)
- [ ] 7.6 Criar job agendado (ou middleware) para limpar blocklist de tokens expirados
- [ ] 7.7 Atualizar middleware JWT para verificar blocklist
- [ ] 7.8 No frontend, implementar axios interceptor para renovação silenciosa de token
- [ ] 7.9 Atualizar AuthContext e useAuth para gerenciar refresh_token
- [ ] 7.10 Tratar falha de refresh (redirecionar para login)

## 8. Acessibilidade (a11y)

- [ ] 8.1 Adicionar @axe-core/react ao frontend (devDependency)
- [ ] 8.2 Integrar axe-core no App.jsx para auditoria em development mode
- [ ] 8.3 Adicionar aria-labels nos botões da navegação (Início, Perfil, Ajuda, Sair, Tutorial)
- [ ] 8.4 Adicionar aria-labels nos botões do teclado virtual (cada tecla com label descritiva)
- [ ] 8.5 Adicionar aria-labels nos botões Ouvir e Fale nas lições
- [ ] 8.6 Adicionar aria-live="polite" na área de feedback de lição (acertos/erros)
- [ ] 8.7 Garantir contraste mínimo 4.5:1 para textos na paleta atual
- [ ] 8.8 Garantir que todos os modais e overlays (tutorial, achievements) fecham com Escape
- [ ] 8.9 Garantir foco visível (focus ring) em todos os elementos interativos
- [ ] 8.10 Verificar ordem de tabulação na página Lesson e Dashboard
- [ ] 8.11 Executar auditoria axe-core e corrigir violações críticas/sérias
- [ ] 8.12 Adicionar ícone/skip-link "Pular para conteúdo principal"

## 9. Melhoria da Qualidade dos Testes

- [ ] 9.1 Criar teste do hook useSpeech (mockar Web Speech API, testar speak, speakLetter, speakWord)
- [ ] 9.2 Criar teste do hook useSpeechRecognition (mockar SpeechRecognition, testar startListening, callbacks)
- [ ] 9.3 Criar testes das páginas Login e Register (renderização, validação, submit)
- [ ] 9.4 Criar teste isolado da página Profile (exibição de dados do usuário)
- [ ] 9.5 Criar teste do componente LevelUp (renderização, animação, onClose)
- [ ] 9.6 Criar teste do componente ProgressBar (renderização com diferentes valores)
- [ ] 9.7 Criar teste do componente StarRating (exibição de 1, 2, 3 estrelas)
- [ ] 9.8 Criar teste do componente Tutorial (passos, navegação, áudio)
- [ ] 9.9 Expandir teste do Dashboard para cobrir navegação ao clicar em módulo
- [ ] 9.10 Expandir teste do Lesson para cobrir interação de digitação + chamada de API
- [ ] 9.11 Criar teste de integração backend para level-up (xp >= level * 500)
- [ ] 9.12 Criar teste de integração backend para streak (login consecutivo)
- [ ] 9.13 Criar teste de integração backend para Unsplash (mockar httpx, testar branch com chave)
- [ ] 9.14 Adicionar teste de validação: payload inválido, campos obrigatórios, SQL injection tentativa
- [ ] 9.15 Verificar cobertura backend >= 80% e frontend >= 70%

## 10. Integração e Verificação Final

- [ ] 10.1 Executar todos os testes backend (pytest) e verificar cobertura >= 80%
- [ ] 10.2 Executar todos os testes frontend (vitest) e verificar cobertura >= 70%
- [ ] 10.3 Executar testes e2e (Playwright) em Chromium
- [ ] 10.4 Executar auditoria a11y completa e documentar resultado
- [ ] 10.5 Validar fluxo completo no Docker Compose: build → up → testar TTS → testar progresso
- [ ] 10.6 Atualizar .env.example com novas variáveis (LOG_LEVEL, JWT_REFRESH_EXPIRY)
- [ ] 10.7 Verificar que docker-compose healthcheck está funcional (docker ps mostra healthy)
