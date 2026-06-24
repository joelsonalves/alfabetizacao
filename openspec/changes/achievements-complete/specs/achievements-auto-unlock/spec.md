# Achievements — Auto-Unlock

## ADDED Requirements

### Requirement: first_lesson unlocked on first completion

Quando um usuário completa a primeira lição (qualquer lição com `data.completed == true` e o usuário não tem nenhuma conquista `first_lesson`), o sistema DEVE desbloquear automaticamente `first_lesson` para aquele usuário.

A verificação DEVE ser: após `apply_progress_update`, verificar NÃO existe `Achievement` com `user_id` e `achievement_type == "first_lesson"`. Se não existir, chamar `unlock_achievement("first_lesson")`.

#### Scenario: First lesson completed unlocks achievement
- **GIVEN** um usuário sem conquistas
- **WHEN** o usuário completa qualquer lição
- **THEN** `GET /api/progress/achievements` DEVE incluir `"first_lesson"` na resposta

#### Scenario: Subsequent lessons do not re-unlock
- **GIVEN** um usuário que já tem a conquista `first_lesson`
- **WHEN** o usuário completa outra lição
- **THEN** NÃO DEVE haver tentativa de duplicar `first_lesson`

### Requirement: no_errors unlocked on perfect lesson

Quando um usuário completa uma lição com `data.errors == 0` (zero erros de digitação), o sistema DEVE desbloquear automaticamente `no_errors`.

#### Scenario: Perfect lesson unlocks no_errors
- **GIVEN** um usuário sem a conquista `no_errors`
- **WHEN** o usuário completa uma lição com `kb.errors == 0`
- **THEN** `no_errors` DEVE ser desbloqueado

### Requirement: score_100 unlocked on 100% accuracy

Quando um usuário completa uma lição com precisão de 100% (0 erros E pelo menos 1 acerto), o sistema DEVE desbloquear automaticamente `score_100`.

A diferença de `no_errors` é semântica: `no_errors` requer zero erros, `score_100` requer 100% de precisão. Na prática ambos podem ser disparados pela mesma lição.

#### Scenario: 100% accuracy unlocks score_100
- **GIVEN** um usuário sem a conquista `score_100`
- **WHEN** o usuário completa uma lição com 0 erros e pelo menos 1 tecla correta
- **THEN** `score_100` DEVE ser desbloqueado

### Requirement: all_vowels unlocked when all vowel lessons completed

Quando um usuário completa todas as lições ativas do módulo do tipo `"vowel"`, o sistema DEVE desbloquear automaticamente `all_vowels`.

A verificação DEVE ser: contar lições ativas do módulo `vowel` e comparar com o número de lições completadas pelo usuário naquele módulo. Se todos os `lesson.id` do módulo têm `UserProgress.completed == true`, desbloquear.

#### Scenario: All vowels completed unlocks achievement
- **GIVEN** um módulo Vogais com 5 lições ativas
- **WHEN** o usuário completa a 5ª lição
- **THEN** `all_vowels` DEVE ser desbloqueado

#### Scenario: Some vowels missing keeps achievement locked
- **GIVEN** um módulo Vogais com 5 lições ativas
- **WHEN** o usuário completa apenas 4 lições
- **THEN** `all_vowels` NÃO DEVE ser desbloqueado

### Requirement: all_consonants unlocked when all consonant lessons completed

Mesma lógica de `all_vowels`, mas para o módulo do tipo `"consonant"`.

#### Scenario: All consonants completed unlocks achievement
- **GIVEN** um módulo Consoantes com 10 lições ativas
- **WHEN** o usuário completa a 10ª lição
- **THEN** `all_consonants` DEVE ser desbloqueado

### Requirement: Auto-unlock usa endpoint interno existente

A lógica de auto-unlock DEVE chamar a mesma função usada por `POST /api/progress/achievements/{achievement_type}`, evitando duplicação de código. A função já valida definição ativa e previne duplicatas.

#### Scenario: Auto-unlock reuses unlock endpoint logic
- **GIVEN** a função `unlock_achievement` no router de progress
- **WHEN** o auto-unlock é disparado
- **THEN** DEVE chamar `unlock_achievement` internamente
- **AND** o registro DEVE aparecer em `GET /api/progress/achievements`
