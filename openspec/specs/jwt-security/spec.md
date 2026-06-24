# jwt-security Specification

## Purpose
TBD - created by archiving change resolve-lacunas-arquitetura. Update Purpose after archive.
## Requirements
### Requirement: Refresh token flow
The authentication system SHALL issue both access tokens (15 min expiry) and refresh tokens (7 days expiry).

#### Scenario: Login with refresh token
- **WHEN** user logs in successfully
- **THEN** backend returns access_token (15min) and refresh_token (7 days)

#### Scenario: Token refresh
- **WHEN** user sends valid refresh_token to POST /api/auth/refresh
- **THEN** backend returns a new access_token and a new refresh_token

#### Scenario: Expired refresh token
- **WHEN** user sends expired refresh_token
- **THEN** backend returns HTTP 401 and frontend redirects to login

### Requirement: Logout with token invalidation
The system SHALL provide a logout endpoint that invalidates the refresh token.

#### Scenario: Successful logout
- **WHEN** user calls POST /api/auth/logout with valid refresh_token
- **THEN** backend adds refresh_token to blocklist and returns success

#### Scenario: Blocked token reuse
- **WHEN** user tries to use a blocked refresh_token
- **THEN** backend returns HTTP 401

### Requirement: Token blocklist
The system SHALL store invalidated tokens in a blocklist table in PostgreSQL.

#### Scenario: Blocklist table
- **WHEN** the migration runs
- **THEN** a token_blocklist table is created with columns: id, token_jti, token_type, user_id, created_at, expires_at

#### Scenario: Blocklist cleanup
- **WHEN** a scheduled job runs daily
- **THEN** expired entries in token_blocklist are automatically removed

### Requirement: Silent token refresh
The frontend SHALL automatically refresh the access token before it expires without user interruption.

#### Scenario: Axios interceptor
- **WHEN** an API request returns 401 and a valid refresh_token exists
- **THEN** the axios interceptor automatically calls /api/auth/refresh, retries the original request

#### Scenario: Refresh failure
- **WHEN** the silent refresh fails (refresh_token expired or blocked)
- **THEN** frontend clears auth state and redirects to login page

