# OpenCode — Plataforma de Alfabetização Multissensorial

## Visão

Plataforma web interativa para alfabetização infantil que combine reconhecimento de fala, teclado virtual e feedback visual para criar uma experiência multissensorial de aprendizado.

## Stack

- **Frontend**: React + Vite + CSS Modules
- **Backend**: FastAPI + SQLAlchemy + SQLite (dev) / PostgreSQL (prod)
- **Reconhecimento de Fala**: Web Speech API (`webkitSpeechRecognition`)
- **Testes Frontend**: Vitest + React Testing Library
- **Testes Backend**: pytest

## Workflow: Plan vs Build

Para manter a disciplina entre especificação e implementação, o projeto segue dois modos distintos:

### 🎯 Modo Plan (planejamento)

Ativado quando: o prompt do usuário inicia com `/plan` ou contém "modo plan" ou "openspec plan".

**Atividades permitidas:**
- Criar e editar artefatos OpenSpec (proposal, design, specs, tasks)
- Analisar código existente para fundamentar decisões de design
- Validar proposta com o usuário (refinar requisitos, esclarecer ambiguidades)
- Definir tasks e marcos
- **Commits**: `git add` + `git commit` apenas dos artefatos OpenSpec (arquivos `.md` em `openspec/`), com mensagem descritiva do que foi especificado

**Atividades PROIBIDAS:**
- ❌ Escrever ou modificar código de implementação (JSX, CSS, Python, etc.)
- ❌ Rodar `npm install`, `pip install`, migrações de BD
- ❌ Criar arquivos de implementação fora de `openspec/` e `specs/`

**Fluxo típico:**
1. Usuário descreve o que quer
2. Explorar/Propor → proposal.md
3. Validar e refinar com o usuário
4. design.md + specs/*.md
5. tasks.md
6. `git commit` dos artefatos

### 🏗️ Modo Build (implementação)

Ativado quando: o prompt do usuário inicia com `/build` ou contém "modo build" ou "modo implementação".

**Atividades permitidas:**
- Implementar tasks do change ativo (seguindo `tasks.md`)
- Criar e modificar código de implementação (JSX, CSS, Python, etc.)
- Rodar testes (`npm test`, `pytest`)
- Fazer commits de código

**Atividades PROIBIDAS:**
- ❌ Modificar proposal, design, specs ou tasks sem retornar ao modo Plan
- ❌ Adicionar funcionalidades não especificadas nas tasks

**Fluxo típico:**
1. Selecionar change com tasks pendentes (`/opsx-apply`)
2. Implementar tarefa por tarefa
3. Rodar testes a cada tarefa concluída
4. Ao final, sugerir `/opsx-archive`

### Regra de Ouro

> **Toda mudança começa no modo Plan e só vai para Build após tasks estarem definidas e commitadas.**
> Se durante o Build surgir um novo requisito não especificado, pause e volte ao Plan primeiro.

## Convenções

- Nomes de change em kebab-case: `syllable-blending`, `fix-speech-timing`
- Specs em `openspec/specs/<capability>/spec.md`
- Commits de plan: `plan(<change-name>): <descrição>`
- Commits de build: `feat(<change-name>): <descrição>` ou `fix(<change-name>): <descrição>`

## Contexto do Projeto

- Tipos de lição: `letter`, `consonant`, `syllable`, `blending` (novo), `word`, `phrase`, `sentence`, `review`
- 7 módulos de aprendizado (8 com blending), cada um com 8-20 lições
- Hooks críticos: `useSpeechRecognition`, `useKeyboard`, `useProgress`
- Componente principal: `Lesson.jsx` — renderiza o tipo de lição apropriado
