# auth-refresh-flow Specification

## Purpose
TBD - created by archiving change api-progress-401. Update Purpose after archive.
## Requirements
### Requirement: Frontend logs auth context at Dashboard mount
The system SHALL log key auth state information to the browser console when the Dashboard mounts, to aid in diagnosing auth-related issues without breaking the user experience.

#### Scenario: Dashboard logs token existence on mount
- **WHEN** the Dashboard component mounts
- **THEN** the system SHALL log `[AuthDiagnostic] token exists: true|false` and `[AuthDiagnostic] refresh_token exists: true|false` to the browser console

#### Scenario: Dashboard logs me() response on mount
- **WHEN** the AuthContext initialization (`me()` call) completes
- **THEN** the system SHALL log `[AuthDiagnostic] me() status: <status>` and `[AuthDiagnostic] me() user: <userId or null>` to the browser console

### Requirement: Backend logs auth failure details
When an authenticated endpoint returns 401, the backend SHALL log the reason (missing header, invalid scheme, expired token, revoked token, user not found) to aid remote diagnosis.

#### Scenario: Backend logs 401 reason
- **WHEN** `get_current_user` raises HTTPException(status_code=401)
- **THEN** the backend SHALL log `[AuthDiagnostic] 401: <reason>` with the specific failure reason
- **AND** the response body SHALL include a `detail` field with the specific reason

### Requirement: Access token TTL is increased to 24 hours
The access token lifetime SHALL be increased from 15 minutes to 24 hours in both the login and refresh endpoints.

#### Scenario: Login creates token with 24h expiry
- **WHEN** `POST /api/auth/login` succeeds
- **THEN** the returned access token SHALL have an `exp` claim 24 hours from creation time

#### Scenario: Refresh creates token with 24h expiry
- **WHEN** `POST /api/auth/refresh` succeeds
- **THEN** the returned access token SHALL have an `exp` claim 24 hours from creation time

### Requirement: Auth initialization race condition is eliminated
The AuthContext SHALL guarantee that `user` and `isAuthenticated` reflect the true auth state before any protected component renders. The context SHALL expose a boolean `isAuthenticated` derived from the validated user, not from the presence of a token in localStorage.

#### Scenario: Page refresh with valid token sets isAuthenticated=true
- **WHEN** the app loads with a valid (non-expired) token in localStorage
- **AND** `api.auth.me()` returns 200 with user data
- **THEN** `isAuthenticated` SHALL be `true`
- **AND** `user` SHALL contain the user object
- **AND** ProtectedRoute SHALL render the children

#### Scenario: Page refresh with expired token triggers refresh and sets isAuthenticated=true
- **WHEN** the app loads with an expired token in localStorage
- **AND** a valid refresh_token exists
- **AND** `api.auth.refresh()` succeeds
- **THEN** the new access token SHALL be stored in localStorage
- **AND** `isAuthenticated` SHALL be `true`

#### Scenario: Page refresh with no token sets isAuthenticated=false
- **WHEN** the app loads with no token in localStorage
- **THEN** `isAuthenticated` SHALL be `false`
- **AND** `user` SHALL be `null`
- **AND** ProtectedRoute SHALL redirect to `/login`

### Requirement: Refresh retry logic handles concurrent 401s
When multiple authenticated requests fail simultaneously with 401, the system SHALL attempt a single refresh and retry all queued requests, preventing redundant refresh calls.

#### Scenario: Concurrent requests trigger single refresh
- **WHEN** two or more authenticated API calls receive 401 responses simultaneously
- **THEN** only one refresh request SHALL be sent
- **AND** all original requests SHALL be retried with the new token upon success
- **AND** all original requests SHALL fail with the original 401 error if refresh fails

### Requirement: Dashboard handles auth failure gracefully
If the progress fetch fails due to auth issues, the Dashboard SHALL display a user-friendly error message instead of a blank or loading screen.

#### Scenario: Dashboard shows message on 401 progress fetch
- **WHEN** `api.progress.get()` fails with 401
- **THEN** the Dashboard SHALL display the message "Erro de autenticação. Faça login novamente."
- **AND** the Dashboard SHALL display a login button linking to `/login`
- **AND** the Dashboard SHALL still show modules (from the non-auth modules fetch)

### Requirement: Automated tests cover refresh flow
The system SHALL include automated tests that validate the token refresh flow end-to-end.

#### Scenario: Frontend test — request() retries after refresh
- **WHEN** `request()` receives a 401 on a non-auth endpoint
- **AND** refresh tokens are valid
- **THEN** the original request SHALL be retried with the new token
- **AND** the final response SHALL be the successful response

#### Scenario: Frontend test — request() redirects to login when refresh fails
- **WHEN** `request()` receives a 401 on a non-auth endpoint
- **AND** refresh fails (e.g., 401 or network error)
- **THEN** tokens SHALL be removed from localStorage
- **AND** `window.location.href` SHALL be set to `/login`

#### Scenario: Backend test — refresh endpoint returns new token
- **WHEN** `POST /api/auth/refresh` is called with a valid refresh token
- **THEN** the response SHALL return 200
- **AND** the response SHALL include a new access token and a new refresh token
- **AND** the new access token SHALL have a 24-hour expiry

#### Scenario: Backend test — refresh endpoint rejects expired refresh token
- **WHEN** `POST /api/auth/refresh` is called with an expired refresh token
- **THEN** the response SHALL return 401
- **AND** the detail SHALL be "Invalid refresh token"

