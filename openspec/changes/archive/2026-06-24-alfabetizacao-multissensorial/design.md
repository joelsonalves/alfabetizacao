## Context

Sistema web novo para alfabetização multissensorial com digitação. Não há código legado — tudo será construído do zero. O projeto utiliza OpenSpec como workflow de desenvolvimento.

Stack definida: React + Vite (frontend), FastAPI + SQLAlchemy (backend), PostgreSQL (banco), Docker Compose (deploy).

## Goals / Non-Goals

**Goals:**
- Sistema funcional de alfabeticação com 7 níveis progressivos
- Autenticação JWT com salvamento de progresso por usuário
- Teclado virtual + físico com feedback sonoro TTS em PT-BR
- Reconhecimento de fala para prática de pronúncia
- Imagens multissensoriais (emojis/SVG + imagens reais)
- Gamificação completa (pontos, estrelas, streaks, conquistas)
- Tutorial interativo texto + áudio
- Deploy via Docker Compose em VPS

**Non-Goals:**
- Aplicativo mobile nativo (apenas web responsivo)
- Suporte offline completo (requer conexão com internet)
- Inteligência artificial para geração de conteúdo (imagens serão de fontes públicas/emojis)
- Gamificação competitiva multiplayer (apenas individual)
- Suporte multilíngue inicial (apenas português brasileiro)

## Decisions

1. **FastAPI + SQLAlchemy**: Python moderno com tipagem forte, documentação automática (Swagger/OpenAPI), ORM maduro com migrations via Alembic.
2. **JWT para autenticação**: Simples, stateless, sem sessão em servidor. Token com expiry configurável.
3. **Web Speech API (TTS + Recognition)**: API nativa do navegador, zero dependências externas para áudio. Qualidade depende das vozes instaladas no SO.
4. **Emojis + imagens reais (misto)**: Emojis/SVG para letras e consoantes (leves, sempre disponíveis). Imagens reais via Unsplash API ou fallback local para palavras/frases (maior impacto visual).
5. **Estrutura monolítica no backend**: FastAPI single-process com rotas organizadas por domínio (auth, modules, progress). Separação futura em microsserviços é possível mas desnecessária agora.
6. **Docker Compose**: 3 serviços (postgres, backend, frontend-nginx). Frontend servido por Nginx para assets estáticos + proxy reverso para API.
7. **Cores suaves**: Paleta #F5F0EB (fundo), #3D8D8C (primary), #E8A838 (accent), #6BBF59 (success), #2D2D2D (texto). Design minimalista sem elementos distractivos.

## Risks / Trade-offs

- [Qualidade do TTS] → Depende das vozes PT-BR disponíveis no SO/navegador. Mitigação: detectar voice disponível e mostrar fallback textual se nenhuma for encontrada.
- [Web Speech Recognition] → Suporte experimental em alguns navegadores. Mitigação: recurso opcional (não bloqueia o uso do sistema).
- [Imagens externas (Unsplash)] → Depende de API externa com rate limiting. Mitigação: cache local das imagens + fallback para SVGs/emojis.
- [Escopo grande] → 7 níveis de aprendizado é ambicioso. Mitigação: priorizar implementação vertical (um nível completo de cada vez).