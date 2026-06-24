## Why

Crianças e adultos em processo de alfabetização carecem de ferramentas que integrem a digitação no computador com o aprendizado da leitura de forma multissensorial. O sistema proposto combina visão (imagens, cores), audição (síntese de fala PT-BR), tato (digitação) e fala (reconhecimento de voz) para criar uma experiência imersiva e eficaz de alfabetização, permitindo que o usuário aprenda a ler enquanto aprende a teclar.

## What Changes

- Sistema web completo com frontend React + Vite e backend FastAPI + PostgreSQL
- Autenticação de usuários com cadastro, login e recuperação de progresso
- Teclado virtual interativo que reage ao teclado físico e reproduz sons das letras em português brasileiro via Web Speech API (TTS)
- 7 níveis progressivos de aprendizado: vogais, consoantes, sílabas simples, sílabas complexas, palavras, frases e orações
- Imagens associadas a consoantes, palavras e frases (emojis/SVG para letras, imagens reais para palavras/frases)
- Reconhecimento de fala (Web Speech Recognition) para praticar pronúncia
- Gamificação completa com pontos, estrelas, streaks, conquistas e progressão por níveis
- Tutorial interativo em texto e áudio no primeiro acesso
- Interface com cores suaves e agradáveis, anti-distração
- Deploy via Docker Compose

## Capabilities

### New Capabilities
- `user-auth`: Cadastro, login, autenticação JWT e gerenciamento de sessão
- `learning-modules`: Módulos de aprendizado progressivos (vogais, consoantes, sílabas, palavras, frases, orações)
- `typing-practice`: Teclado virtual com detecção de teclado físico e feedback visual
- `audio-feedback`: Síntese de fala PT-BR para letras, sílabas, palavras e frases via Web Speech API
- `speech-recognition`: Reconhecimento de fala para praticar pronúncia
- `image-assets`: Banco de imagens multissensoriais (emojis/SVG + imagens reais)
- `gamification`: Sistema de pontos, estrelas, streaks, conquistas e progressão
- `tutorial`: Tutorial interativo em texto e áudio
- `user-progress`: Salvamento e restauração de progresso do usuário
- `docker-deployment`: Infraestrutura Docker Compose para deploy em VPS

### Modified Capabilities
<!-- Nenhuma capability existente está sendo modificada -->

## Impact

- Novo frontend React + Vite em `frontend/`
- Novo backend FastAPI + SQLAlchemy em `backend/`
- Novo banco PostgreSQL com schema de usuários, progresso, módulos e conquistas
- Novas dependências: React, Vite, FastAPI, SQLAlchemy, Alembic, PostgreSQL, JWT
- Infraestrutura Docker: `docker-compose.yml`, Dockerfiles para frontend e backend
- Nenhum sistema existente é afetado (projeto novo)
