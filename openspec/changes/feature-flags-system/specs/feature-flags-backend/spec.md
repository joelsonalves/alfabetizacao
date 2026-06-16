## ADDED Requirements

### Requirement: User model has is_admin field

The `User` model SHALL have a Boolean column `is_admin` that defaults to `False`.

#### Scenario: New users are not admin
- **WHEN** a new user registers
- **THEN** `user.is_admin` SHALL be `False`

#### Scenario: Admin user from seed
- **WHEN** seed script runs
- **THEN** a user with email `admin@admin.com` SHALL be created with `is_admin = True`

### Requirement: FeatureFlag model exists

The system SHALL have a `FeatureFlag` model with columns:
- `key`: String, unique, primary-key-like identifier (e.g. `"module.vowel"`)
- `active`: Boolean, default `True`
- `behavior_on_inactive`: String, either `"hidden"` or `"locked"`, default `"hidden"`
- `description`: Text, human-readable description of the resource

#### Scenario: FeatureFlag table is created
- **WHEN** the application starts or migrations run
- **THEN** a `feature_flags` table SHALL exist with the defined columns

#### Scenario: FeatureFlag key is unique
- **WHEN** two flags with the same key are inserted
- **THEN** the database SHALL enforce a unique constraint

### Requirement: Seed creates initial feature flags

The seed script SHALL create the following feature flags:

| key | description | active | behavior |
|-----|-------------|--------|----------|
| `module.vowel` | Módulo Vogais | true | hidden |
| `module.consonant` | Módulo Consoantes | true | hidden |
| `module.simple_syllable` | Módulo Sílabas Simples | true | hidden |
| `module.complex_syllable` | Módulo Sílabas Complexas | true | hidden |
| `module.blending` | Módulo Montagem Silábica | true | hidden |
| `module.word` | Módulo Palavras | true | hidden |
| `module.phrase` | Módulo Frases | true | hidden |
| `module.sentence` | Módulo Orações | true | hidden |
| `feature.tutorial` | Tutorial de boas-vindas | true | hidden |
| `feature.help_button` | Botão de ajuda flutuante | true | hidden |
| `feature.level_up` | Modal de subida de nível | true | hidden |

#### Scenario: Flags are created on seed
- **WHEN** `python seed.py` runs and no flags exist
- **THEN** 11 feature flags SHALL be created with the keys listed above

### Requirement: JWT includes is_admin claim

`create_access_token` SHALL include the `is_admin` field from the user in the token payload.

The login, refresh, and `/auth/me` responses SHALL include `is_admin` in the user object.

#### Scenario: Login returns is_admin
- **WHEN** a user logs in successfully
- **THEN** the response SHALL contain `user.is_admin` as a boolean

#### Scenario: Admin token has is_admin claim
- **WHEN** `create_access_token` is called with an admin user
- **THEN** the encoded token SHALL contain `is_admin: true`

### Requirement: require_admin dependency exists

A FastAPI dependency `require_admin` SHALL check `get_current_user` and raise HTTP 403 if `user.is_admin` is not `True`.

#### Scenario: Non-admin gets 403
- **WHEN** a non-admin user calls an admin endpoint
- **THEN** the response SHALL have status 403 with detail "Admin access required"

### Requirement: GET /admin/feature-flags lists all flags

This endpoint SHALL return all feature flags regardless of active status. Protected by `require_admin`.

#### Scenario: Admin lists all flags
- **WHEN** an admin user calls `GET /admin/feature-flags`
- **THEN** the response SHALL include all 11 flags with their `key`, `active`, `behavior_on_inactive`, `description`

### Requirement: PATCH /admin/feature-flags/{key} toggles a flag

This endpoint SHALL accept `{ "active": boolean, "behavior_on_inactive": "hidden" | "locked" }`. Protected by `require_admin`.

#### Scenario: Admin disables a module
- **WHEN** an admin calls `PATCH /admin/feature-flags/module.vowel` with `{"active": false}`
- **THEN** the flag SHALL be updated with `active: false`

#### Scenario: Admin changes behavior
- **WHEN** an admin calls `PATCH /admin/feature-flags/module.vowel` with `{"behavior_on_inactive": "locked"}`
- **THEN** the flag SHALL be updated with `behavior_on_inactive: "locked"`

#### Scenario: Toggle non-existent flag returns 404
- **WHEN** an admin calls `PATCH /admin/feature-flags/nonexistent`
- **THEN** the response SHALL have status 404

### Requirement: GET /feature-flags returns only active flags

This endpoint SHALL return only flags where `active === true`. Any authenticated user can access it.

#### Scenario: Frontend fetches active flags
- **WHEN** any authenticated user calls `GET /feature-flags`
- **THEN** the response SHALL include only flags with `active: true`

#### Scenario: Disabled flag is excluded
- **WHEN** `module.vowel` has `active: false`
- **THEN** `GET /feature-flags` SHALL NOT include `module.vowel` in the response
