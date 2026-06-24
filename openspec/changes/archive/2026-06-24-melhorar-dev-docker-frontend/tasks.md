## 1. Criar Dockerfile.dev para o frontend

- [x] 1.1 Criar `frontend/Dockerfile.dev` com base node:20-alpine, `npm ci`, `npm run dev -- --host`

## 2. Criar docker-compose.override.yml

- [x] 2.1 Criar `docker-compose.override.yml` na raiz com:
  - Build usando `Dockerfile.dev`
  - Volume mount: `./frontend:/app`
  - Volume anônimo: `/app/node_modules`
  - Porta `5173:5173`
  - Comando: `npm run dev -- --host 0.0.0.0 --port 5173`

## 3. Corrigir proxy do Vite para Docker

- [x] 3.1 Modificar `frontend/vite.config.js` para usar `process.env.VITE_API_PROXY || 'http://localhost:8000'` como target do proxy
- [x] 3.2 Adicionar `VITE_API_PROXY=http://backend:8000` no `docker-compose.override.yml`

## 4. Verificação

- [x] 4.1 Executar `docker compose down` e `docker compose up -d` — containers rodando com dev override
- [x] 4.2 Acessar `http://localhost:5173` — Vite responde com HTTP 200, frontend carrega
- [x] 4.3 Hot reload confirmado — Vite aplica alterações em tempo real sem rebuild
- [x] 4.4 Testar login com credenciais inválidas — backend retorna `{"detail":"Email ou senha inválidos"}` HTTP 401 ✅, Vite proxy retorna o mesmo ✅
- [x] 4.5 Verificar produção: `docker compose -f docker-compose.yml up -d` → nginx responde HTTP 200 em `http://localhost:80` ✅, login retorna 401 ✅

## 5. Teste Playwright para login inválido

- [x] 5.1 Adicionar `name="email"` e `name="password"` nos inputs do formulário de login (`Login.jsx`)
- [x] 5.2 Criar `frontend/src/e2e/login-error.spec.js` com teste de credenciais inválidas
