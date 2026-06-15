## Why

Atualmente, alterações no frontend exigem reconstrução da imagem Docker para surtirem efeito (`docker compose build frontend`), pois não há montagem de volume para o código-fonte. Já o backend utiliza `volumes: ./backend:/app` + `--reload`, permitindo que mudanças sejam refletidas instantaneamente no container. Essa assimetria torna o desenvolvimento no frontend mais lento e propenso a esquecimentos (como ocorrido na correção anterior, que não funcionou até o rebuild manual).

## What Changes

- **Adicionar volume mount para o frontend** no `docker-compose.yml`: mapear `./frontend:/app` para que as alterações no código-fonte sejam refletidas no container.
- **Alterar o comando do frontend** para usar o servidor de desenvolvimento Vite (`npm run dev -- --host`) em vez do nginx, quando em modo de desenvolvimento.
- **Criar `docker-compose.override.yml`**: Arquivo de override automático do Docker Compose que substitui o serviço `frontend` para usar Vite dev server com hot reload durante o desenvolvimento. Isso mantém o `docker-compose.yml` original intacto para produção.

## Capabilities

### New Capabilities
- `docker-dev-frontend`: Hot reload do frontend em container Docker, espelhando mudanças em tempo real.

### Modified Capabilities
- `docker-deployment` (modificado): Agora com suporte a modo de desenvolvimento para frontend via override.

## Impact

- **Novo arquivo**: `docker-compose.override.yml` na raiz do projeto
- **docker-compose.yml**: Não sofre alterações (override é automático)
- **Nenhuma mudança breaking**: O override só é aplicado quando o arquivo existe. Para produção, basta não incluir o `docker-compose.override.yml` ou usar `docker compose -f docker-compose.yml up` sem o override.
- **Porta de acesso em dev**: `http://localhost:5173` (Vite) em vez de `http://localhost:80` (nginx)
