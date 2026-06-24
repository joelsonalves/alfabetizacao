## Why

O sistema de conquistas tem uma base sólida no backend (modelos, endpoints, seed, testes) mas a experiência do usuário fica incompleta: o perfil exibe o tipo bruto (`"first_lesson"`) em vez do nome legível (`"Primeira Lição!"`), o ícone é um `🏅` genérico em vez do emoji específico de cada conquista, e nenhuma conquista é desbloqueada automaticamente durante o uso normal do aplicativo.

## What Changes

### 1. Perfil — Nome e ícone corretos
- Profile.jsx deve buscar `AchievementDefinition` para resolver `achievement_type` → nome, descrição, ícone
- Exibir nome legível, descrição, ícone emoji correto e data de desbloqueio
- Fallback: se definition não existir, mostrar `achievement_type` e `🏅`

### 2. Auto-unlock no backend
- Após `POST /api/progress/lesson/{id}`, verificar e desbloquear automaticamente:
  - `first_lesson` — primeira lição completa
  - `no_errors` — lição com 0 erros
  - `score_100` — lição com 100% de precisão
  - `all_vowels` / `all_consonants` — completar todas as lições de um módulo
- Verificação de streak (3/7/30 dias) deve ser feita ao atualizar progresso ou em endpoint separado
- Chamadas internas para `POST /api/progress/achievements/{type}` (reuso do endpoint existente)

### 3. Seed automático
- `seed_all()` deve ser chamado no startup do app (lifespan event) se tabelas estiverem vazias

### 4. Backend — endpoint de definições
- Adicionar `GET /api/achievement-definitions` para que o frontend possa buscar nome/ícone/descrição

## Capabilities

### New Capabilities
- `achievements-profile`: Perfil exibe conquistas com nome, ícone, descrição e data corretos
- `achievements-auto-unlock`: Desbloqueio automático de conquistas no backend
- `achievements-definitions-api`: Endpoint público para listar definições de conquistas

### Modified Capabilities
- Nenhuma — este é um conjunto novo de funcionalidades

## Impact

- **Backend**: `backend/app/routes/progress.py` — adicionar lógica de auto-unlock; `backend/app/routes/achievements.py` (novo) — endpoint de definições; `backend/app/main.py` — wire seed
- **Frontend**: `frontend/src/pages/Profile.jsx` — buscar definitions e exibir nome/ícone corretos
- **Sem alterações**: banco, migrations, schemas (já existem)
