## ADDED Requirements

### Requirement: Optimistic locking on UserProgress
The UserProgress model SHALL include a version column for optimistic locking to prevent concurrent write conflicts.

#### Scenario: Version column exists
- **WHEN** the database migration runs
- **THEN** the user_progress table has a version column (integer, default 0)

#### Scenario: Successful update with matching version
- **WHEN** user submits progress update with correct version number
- **THEN** the update succeeds and version is incremented

#### Scenario: Conflict on stale version
- **WHEN** user submits progress update with outdated version number (another session already updated)
- **THEN** the backend returns HTTP 409 Conflict with current state data

### Requirement: Frontend conflict handling
The frontend SHALL handle 409 Conflict responses gracefully.

#### Scenario: Automatic retry on conflict
- **WHEN** frontend receives 409 response during progress save
- **THEN** it re-fetches current progress and retries the save once automatically

#### Scenario: User notification
- **WHEN** automatic retry also fails
- **THEN** frontend shows a non-blocking notification "Seu progresso foi atualizado de outra janela" and refreshes the display

### Requirement: Locking scope
Optimistic locking SHALL apply to UserProgress records per user per lesson.

#### Scenario: Per-lesson granularity
- **WHEN** two browser tabs save progress on different lessons simultaneously
- **THEN** both saves succeed without conflict

#### Scenario: Same lesson conflict
- **WHEN** two browser tabs save progress on the same lesson simultaneously
- **THEN** one succeeds, the other receives 409
