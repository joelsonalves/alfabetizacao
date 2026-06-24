# Achievements — Profile Display

## ADDED Requirements

### Requirement: Profile fetches achievement definitions

O componente `Profile.jsx` DEVE chamar `GET /api/achievement-definitions` em paralelo com as chamadas existentes (`api.progress.achievements()`, `api.progress.get()`) e armazenar o resultado para uso no display.

#### Scenario: Definitions fetched on profile mount
- **GIVEN** um usuário na página de perfil
- **WHEN** o componente Profile monta
- **THEN** `GET /api/achievement-definitions` DEVE ser chamado
- **AND** as definições DEVEM estar disponíveis para renderização

### Requirement: Profile exibe nome, ícone, descrição e data corretos

O perfil DEVE exibir cada conquista do usuário com:
- Ícone da definição (ex: `"🏆"`, `"🔥"`, `"💪"`, `"👑"`, `"🔤"`, `"🔠"`, `"💯"`, `"⭐"`) — NÃO o `🏅` genérico
- Nome legível da definição (ex: `"Primeira Lição!"`) — NÃO o `achievement_type` bruto
- Descrição da definição (ex: `"Complete sua primeira lição"`)
- Data de desbloqueio formatada (ex: `"15/01/2026"`)

#### Scenario: Correct name and icon displayed
- **GIVEN** um usuário com a conquista `first_lesson`
- **WHEN** o perfil renderiza as conquistas
- **THEN** DEVE mostrar `"🏆"` e `"Primeira Lição!"`
- **AND** NÃO DEVE mostrar `"🏅"` ou `"first_lesson"`

#### Scenario: Unlocked date is displayed
- **GIVEN** um usuário com a conquista `first_lesson` desbloqueada em `2026-01-15T10:30:00Z`
- **WHEN** o perfil renderiza as conquistas
- **THEN** DEVE mostrar a data formatada `"15/01/2026"` junto ao card

### Requirement: Fallback para definição ausente

Se uma definição não existir para um `achievement_type` (ex: conquista de tipo removido), o card DEVE mostrar `achievement_type` como nome e `🏅` como ícone, sem quebrar a página.

#### Scenario: Card shows fallback for missing definition
- **GIVEN** um usuário com conquista de tipo `"legacy_type"` que não existe nas definições
- **WHEN** o perfil renderiza as conquistas
- **THEN** o card DEVE mostrar `"legacy_type"` como nome e `🏅` como ícone
- **AND** a página NÃO DEVE quebrar

### Requirement: Empty state preservado

Se o usuário não tem conquistas, o perfil DEVE continuar mostrando "Nenhuma conquista ainda. Continue praticando!" (comportamento atual inalterado).

#### Scenario: Empty state shown when no achievements
- **GIVEN** um usuário sem nenhuma conquista
- **WHEN** o perfil renderiza a seção de conquistas
- **THEN** DEVE mostrar "Nenhuma conquista ainda. Continue praticando!"
