## Context

O projeto usa Docker Compose com 3 serviços: postgres, backend e frontend. O backend já possui suporte a desenvolvimento com volume mount + `--reload`. O frontend é construído como imagem de produção (multi-stage: node build → nginx) sem volume mount, exigindo rebuild a cada alteração.

**Stack atual:** Docker Compose 3.8, Node 20 (build), Nginx 1.26 (runtime), Vite (dev server).

## Goals / Non-Goals

**Goals:**
- Alterações no código-fonte do frontend devem ser refletidas em tempo real no container Docker (hot reload)
- Manter o `docker-compose.yml` original intacto para produção (sem modificações)
- Usar o padrão `docker-compose.override.yml` do Docker Compose, que é carregado automaticamente
- Mínimo de configuração adicional

**Non-Goals:**
- Não alterar o Dockerfile de produção do frontend
- Não adicionar dependências ou serviços extras
- Não quebrar o fluxo de produção existente

## Decisions

| Decisão | Alternativas | Justificativa |
|---------|-------------|---------------|
| **`docker-compose.override.yml`** (arquivo separado) | Modificar `docker-compose.yml` diretamente, ou criar `docker-compose.dev.yml` + flag `-f` | O override é automático e não requer flags extras. O arquivo original permanece limpo para produção |
| **Vite dev server** (`npm run dev -- --host`) | Watcher que rebuilda o bundle, ou volume mount com nginx servindo HTML estático | Hot reload do Vite é instantâneo (HMR). Nginx serviria arquivos desatualizados sem rebuild |
| **Porta 5173** em vez de 80 | Manter porta 80 com nginx fazendo proxy reverso para Vite | Simplicidade: acesso direto ao Vite. O proxy embutido do Vite já redireciona `/api` para o backend |
| **Target do proxy via env var** (`VITE_API_PROXY`) | Hardcoded `http://localhost:8000` | Dentro do container Docker, `localhost:8000` NÃO é o backend (é o próprio container). Usar `backend:8000` (nome do serviço Docker) resolve corretamente |
| **Node.js como imagem base** em vez de nginx | Usar nginx + rebuild ao salvar | Node é necessário para rodar Vite. A imagem node:20-alpine é leve o suficiente para dev |

## Arquivo `docker-compose.override.yml` (proposto)

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev    # Dockerfile diferente para dev
    volumes:
      - ./frontend:/app
      - /app/node_modules           # volume anônimo para não sobrescrever node_modules do container
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=/api
      - VITE_TTS_LANG=pt-BR
      - VITE_API_PROXY=http://backend:8000   # Docker service name, NÃO localhost
    command: npm run dev -- --host 0.0.0.0 --port 5173
```

### `vite.config.js` (modificado)

O target do proxy foi alterado de hardcoded para usar variável de ambiente:

```javascript
// Antes:
target: 'http://localhost:8000',

// Depois:
target: process.env.VITE_API_PROXY || 'http://localhost:8000',
```

**Motivação:** Dentro do container Docker, `localhost:8000` aponta para o próprio container do frontend, não para o backend. A variável `VITE_API_PROXY=http://backend:8000` no `docker-compose.override.yml` faz o proxy apontar para o nome do serviço Docker, que resolve corretamente.

### Dockerfile.dev (proposto)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
```

## Uso

**Desenvolvimento:**
```bash
docker compose up -d    # automaticamente usa docker-compose.override.yml
# Acessar http://localhost:5173
```

**Produção:**
```bash
docker compose -f docker-compose.yml up -d    # ignora o override
# Acessar http://localhost:80
```

## Risks / Trade-offs

- **Porta conflitante**: Se o usuário já tiver algo na porta 5173, pode haver conflito. Mitigação: documentar a porta e permitir configuração via variável de ambiente.
- **Performance do Vite em container**: O HMR pode ser mais lento em volumes montados (especialmente no macOS). Mitigação: usar `CHOKIDAR_USEPOLLING=true` se necessário, ou usar `WATCHPACK_POLLING=true`.
- **node_modules do host vs container**: O volume mount pode sobrescrever `node_modules` do container com o do host (que pode estar vazio ou diferente). Mitigação: volume anônimo `/app/node_modules` no override.
