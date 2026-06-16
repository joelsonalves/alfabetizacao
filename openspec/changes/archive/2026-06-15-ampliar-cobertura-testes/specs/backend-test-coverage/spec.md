## ADDED Requirements

### Requirement: Cleanup service must be tested
The token blocklist cleanup service SHALL have tests covering both sync and async paths.

#### Scenario: Sync cleanup deletes expired tokens
- **WHEN** `clean_expired_blocklist_sync` is called with a database containing expired token entries
- **THEN** all expired entries SHALL be deleted from the `token_blocklist` table

#### Scenario: Async cleanup task starts without error
- **WHEN** the asyncio background task for cleanup is created
- **THEN** it SHALL run without raising exceptions

### Requirement: Auth error flows must be tested
The `get_current_user` dependency SHALL return 401 for all invalid authentication scenarios.

#### Scenario: Missing authorization header
- **WHEN** a request is made to a protected endpoint without an `Authorization` header
- **THEN** the response SHALL have status 401

#### Scenario: Invalid authorization scheme
- **WHEN** a request is made with an `Authorization` header using a scheme other than `Bearer`
- **THEN** the response SHALL have status 401

#### Scenario: Revoked token (JTI in blocklist)
- **WHEN** a request is made with a valid JWT whose JTI is present in the `token_blocklist`
- **THEN** the response SHALL have status 401

### Requirement: Optimistic locking conflict must be tested
The progress update endpoint SHALL return HTTP 409 when a version conflict is detected.

#### Scenario: Version mismatch causes conflict
- **WHEN** a progress update request includes a `version` that does not match the current database version
- **THEN** the response SHALL have status 409 with a conflict detail message

#### Scenario: Version increments after successful update
- **WHEN** a progress update request succeeds
- **THEN** the `version` column in `user_progress` SHALL be incremented by 1

### Requirement: Word image fallback must be tested
The image endpoint SHALL fall back gracefully when the Unsplash API returns an error.

#### Scenario: Unsplash returns non-200 status
- **WHEN** the Unsplash API returns a non-200 status (e.g., 403)
- **THEN** the endpoint SHALL return a fallback emoji response with status 200

### Requirement: Auth utility services must be unit tested
The authentication utility functions SHALL have direct unit test coverage.

#### Scenario: Hash and verify password
- **WHEN** a password is hashed via `hash_password` and then verified via `verify_password`
- **THEN** verification SHALL return `True` for the correct password and `False` for an incorrect one

#### Scenario: Decode expired token returns None
- **WHEN** `decode_access_token` is called with a token whose `exp` is in the past
- **THEN** it SHALL return `None`

#### Scenario: Create token without sub
- **WHEN** `create_access_token` is called without a `sub` field in the data payload
- **THEN** it SHALL still produce a valid JWT string

### Requirement: Concurrent progress by different users must not conflict
Two different users saving progress on the same lesson SHALL not interfere with each other.

#### Scenario: Two users save progress on same lesson
- **WHEN** two different authenticated users each POST progress updates for the same lesson ID
- **THEN** both requests SHALL succeed with status 200
- **AND** each user SHALL have their own progress record in the database
