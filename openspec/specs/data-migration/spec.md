# data-migration Specification

## Purpose
TBD - created by archiving change resolve-lacunas-arquitetura. Update Purpose after archive.
## Requirements
### Requirement: Versioned migration scripts
All database schema changes SHALL have Alembic migration scripts with both upgrade() and downgrade() functions.

#### Scenario: Migration execution
- **WHEN** `alembic upgrade head` is executed
- **THEN** all pending migrations run in order and database schema is up to date

#### Scenario: Rollback
- **WHEN** `alembic downgrade -1` is executed
- **THEN** the last migration is reversed without data loss for unaffected tables

### Requirement: Seed data as migration
Initial seed data (learning modules, lessons, achievements) SHALL be managed through Alembic migrations rather than standalone scripts.

#### Scenario: Seed data migration
- **WHEN** `alembic upgrade head` runs on a fresh database
- **THEN** all seed content (7 learning levels, lessons, achievements) is inserted automatically

#### Scenario: Seed data rollback
- **WHEN** `alembic downgrade` reverses a seed migration
- **THEN** the corresponding seed data is removed cleanly

### Requirement: Migration naming convention
Migration scripts SHALL follow a descriptive naming convention.

#### Scenario: Descriptive names
- **WHEN** a new migration is created with `alembic revision --autogenerate -m "description"`
- **THEN** the migration filename includes a human-readable description (e.g., `add_token_blocklist_table`)

