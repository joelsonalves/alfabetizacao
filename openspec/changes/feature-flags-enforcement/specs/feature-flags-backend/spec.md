# Feature Flags — Enforcement Backend

## MODIFIED Requirements

### Requirement: GET /feature-flags returns only active flags (com cache)

This endpoint SHALL return only flags where `active === true`. Qualquer usuário autenticado pode acessá-lo.

O resultado DEVE ser cacheado em Redis com key `feature_flags:all` e TTL de 300 segundos. Se Redis estiver indisponível, DEVE cair no banco de dados.

#### Scenario: Frontend fetches active flags
- **WHEN** any authenticated user calls `GET /feature-flags`
- **THEN** the response SHALL include only flags with `active: true`

#### Scenario: Disabled flag is excluded
- **WHEN** `dashboard_module_vowel` has `active: false`
- **THEN** `GET /feature-flags` SHALL NOT include `dashboard_module_vowel` in the response

### Requirement: PATCH /admin/feature-flags/{key} invalida cache Redis

Ao alterar uma flag, o admin PATCH DEVE invalidar a chave `feature_flags:all` no Redis.

#### Scenario: Cache is invalidated on flag update
- **GIVEN** a flag `dashboard_module_vowel` with `active: true` cached in Redis
- **WHEN** admin calls `PATCH /admin/feature-flags/dashboard_module_vowel` with `{"active": false}`
- **THEN** the Redis key `feature_flags:all` SHALL be deleted
- **AND** the next `GET /feature-flags` SHALL reflect the new state

### Requirement: GET /api/modules filtra por feature flags

O endpoint `GET /api/modules` DEVE retornar apenas módulos cuja feature flag correspondente está ativa.

O mapping entre `module_type` e flag key DEVE ser:
- `"vowel"` → `"dashboard_module_vowel"`
- `"consonant"` → `"dashboard_module_consonant"`
- `"simple_syllable"` → `"dashboard_module_simple_syllable"`
- `"complex_syllable"` → `"dashboard_module_complex_syllable"`
- `"blending"` → `"dashboard_module_blending"`
- `"word"` → `"dashboard_module_word"`
- `"phrase"` → `"dashboard_module_phrase"`
- `"sentence"` → `"dashboard_module_sentence"`

Módulos sem flag correspondente DEVEM ser retornados normalmente (compatibilidade retroativa).

#### Scenario: Disabled module is excluded from list
- **GIVEN** flag `dashboard_module_vowel` with `active: false`
- **WHEN** any user calls `GET /api/modules`
- **THEN** the module with `module_type="vowel"` SHALL NOT appear in the response

#### Scenario: Module with no flag is returned normally
- **GIVEN** a module with `module_type="custom"` (no matching flag)
- **WHEN** any user calls `GET /api/modules`
- **THEN** this module SHALL still appear in the response

### Requirement: GET /api/modules/{module_id}/lessons bloqueia módulo desativado com 403

O endpoint `GET /api/modules/{module_id}/lessons` DEVE verificar se o módulo está ativo (segundo as mesmas regras de flag do requirement anterior). Se o módulo estiver desativado, DEVE retornar HTTP 403 com `detail="Module is disabled by administrator"`.

O mesmo comportamento DEVE ser aplicado ao endpoint `GET /lessons/{lesson_id}` — se a lição pertence a um módulo desativado, retorna HTTP 403.

#### Scenario: Lessons from disabled module return 403
- **GIVEN** flag `dashboard_module_vowel` with `active: false`
- **WHEN** any user calls `GET /api/modules/1/lessons` (where module 1 is type "vowel")
- **THEN** the response SHALL have status **403** (não 404)
- **AND** `detail` SHALL be `"Module is disabled by administrator"`

#### Scenario: Single lesson from disabled module returns 403
- **GIVEN** flag `dashboard_module_vowel` with `active: false`
- **WHEN** any user calls `GET /lessons/123` (where lesson 123 belongs to module type "vowel")
- **THEN** the response SHALL have status **403**
- **AND** `detail` SHALL be `"Module is disabled by administrator"`

#### Scenario: Non-existent lesson returns 404
- **GIVEN** a lesson ID that does not exist
- **WHEN** any user calls `GET /lessons/99999`
- **THEN** the response SHALL have status **404** (diferente de 403 de módulo desativado)
