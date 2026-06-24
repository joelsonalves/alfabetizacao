## 1. Backend — Definitions API

- [x] 1.1 Criar schema `AchievementDefinitionPublic` em `backend/app/schemas/config.py`
- [x] 1.2 Criar `backend/app/routes/achievements.py` com router e endpoint `GET /api/achievement-definitions`
- [x] 1.3 Registrar router em `backend/app/main.py`

## 2. Backend — Auto-unlock no progress update

- [x] 2.1 Criar `backend/app/services/achievements.py` com `check_and_unlock_achievements`
- [x] 2.2 Implementar verificação de `first_lesson` (primeira conclusão)
- [x] 2.3 Implementar verificação de `no_errors` (data.errors == 0)
- [x] 2.4 Implementar verificação de `score_100` (0 erros + stars >= 3 como proxy)
- [x] 2.5 Implementar verificação de `all_vowels` (todas lições do módulo vowel completas)
- [x] 2.6 Implementar verificação de `all_consonants` (todas lições do módulo consonant completas)
- [x] 2.7 Chamar `check_and_unlock_achievements` em `routes/progress.py` após `apply_progress_update`

## 3. Backend — Seed automático no startup

- [x] 3.1 Em `backend/app/main.py`, no lifespan event, seed definitions se tabela estiver vazia

## 4. Frontend — Profile com nome/ícone/data corretos

- [x] 4.1 Adicionar `api.achievements.definitions()` em `frontend/src/services/api.js`
- [x] 4.2 Em `Profile.jsx`, adicionar chamada `api.achievements.definitions()` no `Promise.all`
- [x] 4.3 Construir lookup map `type → definition` e usar nome, descrição e ícone corretos
- [x] 4.4 Exibir data de desbloqueio formatada em pt-BR
- [x] 4.5 Fallback: se definition não existir, mostrar `achievement_type` e `🏅`

## 5. Backend — errors no schema ProgressUpdate

- [x] 5.1 Adicionar `errors: int = 0` ao `ProgressUpdate` em `backend/app/schemas/module.py`
- [x] 5.2 Enviar `errors: kb.errors` do frontend `Lesson.jsx`

## 5. Verificação

- [ ] 5.1 Testar `GET /api/achievement-definitions` retorna definições ativas
- [ ] 5.2 Testar auto-unlock: completar primeira lição → `first_lesson` aparece nas conquistas
- [ ] 5.3 Testar auto-unlock: completar lição com 0 erros → `no_errors` e `score_100` desbloqueados
- [ ] 5.4 Testar auto-unlock: completar todas as vogais → `all_vowels` desbloqueado
- [ ] 5.5 Testar Profile: conquistas exibem nome, ícone, descrição e data corretos
- [ ] 5.6 Testar Profile: estado vazio quando sem conquistas
- [ ] 5.7 Testar Profile: fallback para definição ausente sem quebrar
