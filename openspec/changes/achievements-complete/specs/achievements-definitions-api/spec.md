# Achievements — Definitions API

## ADDED Requirements

### Requirement: GET /api/achievement-definitions returns all active definitions

O sistema DEVE expor um endpoint público `GET /api/achievement-definitions` que retorna todas as definições de conquistas ativas (`active == true`). Qualquer usuário autenticado pode acessá-lo.

O response DEVE ser uma lista de objetos com:
- `achievement_type`: string (ex: `"first_lesson"`)
- `name`: string legível (ex: `"Primeira Lição!"`)
- `description`: string | null
- `icon`: string (emoji, ex: `"🏆"`) | null

#### Scenario: Authenticated user fetches definitions
- **GIVEN** um usuário autenticado
- **WHEN** `GET /api/achievement-definitions`
- **THEN** o response DEVE conter todas as definições com `active == true`
- **AND** cada definição DEVE incluir `achievement_type`, `name`, `description`, `icon`

#### Scenario: Inactive definitions are excluded
- **GIVEN** uma definição com `active == false`
- **WHEN** `GET /api/achievement-definitions`
- **THEN** essa definição NÃO DEVE aparecer no response

### Requirement: Definitions endpoint reusa AchievementResponse schema

O endpoint DEVE usar um schema `AchievementDefinitionPublic` que expõe apenas campos públicos (`achievement_type`, `name`, `description`, `icon`), NÃO DEVE expor `id`, `criteria`, `active` ou metadados internos.

#### Scenario: Schema excludes internal fields
- **GIVEN** a definição `first_lesson`
- **WHEN** `GET /api/achievement-definitions`
- **THEN** o response NÃO DEVE incluir `id`, `criteria`, ou `active`

### Requirement: Frontend busca definitions ao carregar perfil

O Profile.jsx DEVE chamar `GET /api/achievement-definitions` em paralelo com as chamadas existentes, e usar o resultado para resolver o nome, descrição e ícone de cada conquista do usuário.

#### Scenario: Profile fetches definitions for display
- **GIVEN** um usuário autenticado na página de perfil
- **WHEN** o componente Profile monta
- **THEN** `GET /api/achievement-definitions` DEVE ser chamado
- **AND** o resultado DEVE ser usado para exibir o nome correto e o ícone correto de cada conquista
