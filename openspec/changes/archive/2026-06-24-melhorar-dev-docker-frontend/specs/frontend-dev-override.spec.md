# Frontend Dev Docker Override

## Overview

Adiciona suporte a hot reload no frontend durante o desenvolvimento com Docker, eliminando a necessidade de reconstruir a imagem a cada alteração no código-fonte.

## Requirements

### REQ-001: Volume mount do código-fonte

O container de desenvolvimento do frontend DEVE montar o diretório `./frontend` do host em `/app` no container, para que alterações no código sejam refletidas em tempo real.

#### Scenario: Alteração refletida sem rebuild
- **GIVEN** o container frontend está rodando com o override de desenvolvimento
- **WHEN** um arquivo fonte em `./frontend/src/` é modificado no host
- **THEN** o Vite dev server detecta a mudança e aplica hot reload automaticamente
- **AND** o navegador reflete a alteração sem necessidade de refresh manual

### REQ-002: Servidor de desenvolvimento Vite

O container de desenvolvimento DEVE rodar `npm run dev -- --host` em vez do nginx, para habilitar hot reload.

#### Scenario: Acesso via Vite dev server
- **GIVEN** o container frontend está rodando com o override de desenvolvimento
- **WHEN** o usuário acessa `http://localhost:5173`
- **THEN** o Vite dev server serve o frontend com HMR ativo
- **AND** requisições para `/api/*` são redirecionadas para o backend via proxy do Vite
- **AND** o target do proxy DEVE ser `http://backend:8000` quando em Docker (nome do serviço), NÃO `localhost:8000`

### REQ-005: Proxy configurável via env var

O target do proxy do Vite para `/api/*` DEVE ser configurável via variável de ambiente `VITE_API_PROXY`.

#### Scenario: Proxy funciona em Docker
- **GIVEN** o container frontend está rodando com o override de desenvolvimento
- **WHEN** o `docker-compose.override.yml` define `VITE_API_PROXY=http://backend:8000`
- **THEN** o Vite dev server redireciona `/api/*` para o serviço `backend:8000` dentro da rede Docker
- **AND** requisições de login funcionam corretamente (sem "Internal Server Error")

#### Scenario: Proxy funciona localmente (sem Docker)
- **GIVEN** o frontend está rodando via `npm run dev` no host (sem Docker)
- **WHEN** a variável `VITE_API_PROXY` NÃO está definida
- **THEN** o target do proxy usa o fallback `http://localhost:8000`

### REQ-003: Isolamento do node_modules

O volume mount NÃO DEVE sobrescrever `node_modules` do container com o do host.

#### Scenario: node_modules preservado
- **GIVEN** o container frontend está rodando com o override de desenvolvimento
- **WHEN** o volume `./frontend:/app` é montado
- **THEN** o diretório `/app/node_modules` no container permanece intacto (volume anônimo)
- **AND** as dependências instaladas via `npm ci` no build não são afetadas

### REQ-004: Produção não afetada

O arquivo `docker-compose.override.yml` NÃO DEVE interferir no ambiente de produção.

#### Scenario: Produção sem override
- **GIVEN** o ambiente de produção
- **WHEN** o Docker Compose é iniciado com `docker compose -f docker-compose.yml up`
- **THEN** o override NÃO é carregado
- **AND** o frontend roda com nginx na porta 80 (imagem de produção)

## Files

### `docker-compose.override.yml` (novo)

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=/api
      - VITE_TTS_LANG=pt-BR
      - VITE_API_PROXY=http://backend:8000   # Docker service name, NÃO localhost
    command: npm run dev -- --host 0.0.0.0 --port 5173
```

### `frontend/vite.config.js` (modificado)

O target do proxy foi alterado de hardcoded para usar variável de ambiente:

```javascript
// Antes (linha 10):
target: 'http://localhost:8000',

// Depois:
target: process.env.VITE_API_PROXY || 'http://localhost:8000',
```

**Motivação:** Dentro do container Docker, `localhost:8000` aponta para o próprio container do frontend, não para o backend. Com a env var, o `docker-compose.override.yml` define `VITE_API_PROXY=http://backend:8000`, que resolve para o nome do serviço Docker.

### `frontend/Dockerfile.dev` (novo)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
```

## Test Verification

1. Remover containers existentes: `docker compose down`
2. Subir com override: `docker compose up -d`
3. Verificar que o frontend está acessível em `http://localhost:5173`
4. Fazer uma alteração em `frontend/src/App.jsx` e confirmar hot reload no navegador
5. Verificar que o login com credenciais inválidas exibe a mensagem de erro (teste da correção anterior)
6. Verificar que produção continua funcionando: `docker compose -f docker-compose.yml up -d` → `http://localhost:80`

## Playwright Test: Login Error

**Arquivo:** `frontend/src/e2e/login-error.spec.js`

```javascript
import { test, expect } from '@playwright/test'

test('shows error message for unregistered email', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'email_nao_cadastrado@teste.com')
  await page.fill('[name="password"]', 'teste123')
  await page.click('button[type="submit"]')
  await expect(page.locator('.auth-error')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('.auth-error')).toHaveText(/Email ou senha inválidos/)
  await expect(page).toHaveURL(/\/login/, { timeout: 3000 })
})
```

### Para executar:

```bash
# Certifique-se de que os containers estão rodando com docker compose up -d
# Depois:
npx playwright test --headed src/e2e/login-error.spec.js
```

### Observação sobre `Login.jsx`

Foi necessário adicionar os atributos `name="email"` e `name="password"` nos inputs do formulário de login para que os seletores `[name="email"]` e `[name="password"]` funcionem com Playwright. Os inputs estavam sem o atributo `name`, o que também afetava os testes existentes em `auth.spec.js`.
