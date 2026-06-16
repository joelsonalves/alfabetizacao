## 1. Diagnostic Logging

- [ ] 1.1 Add console.log diagnostic to AuthContext showing token/refresh_token existence and me() response on init
- [ ] 1.2 Add backend logging to `get_current_user` showing the specific 401 reason (missing header, expired, revoked, user not found)
- [ ] 1.3 Add console.log diagnostic to Dashboard showing progress fetch start, success, and failure

## 2. Backend — Token TTL Fix

- [ ] 2.1 Update `login` endpoint in `backend/app/routes/auth.py` to use `settings.jwt_expiry_hours` instead of hardcoded 15 minutes
- [ ] 2.2 Update `refresh` endpoint in `backend/app/routes/auth.py` to also use `settings.jwt_expiry_hours`

## 3. Frontend — AuthContext Race Condition Fix

- [ ] 3.1 Add `isAuthenticated` boolean to AuthContext value, derived from validated user (not from localStorage token presence)
- [ ] 3.2 Update `ProtectedRoute` to use `isAuthenticated` instead of `user` alone for the gate check
- [ ] 3.3 Ensure AuthContext initialization waits for `me()` or `refresh()` to complete before setting `isAuthenticated`

## 4. Frontend — Refresh Retry Logic Hardening

- [ ] 4.1 Review and fix the `request()` refresh subscriber pattern: ensure `isRefreshing` flag is properly reset on failure
- [ ] 4.2 Ensure tokens are cleared AND redirect to /login happens when refresh fails (currently in catch block — verify it works)

## 5. Frontend — Dashboard Graceful Error Handling

- [ ] 5.1 Add state variable `progressError` to Dashboard
- [ ] 5.2 In the `.catch()` of `api.progress.get()`, set `progressError` with the error message
- [ ] 5.3 Render a user-friendly error card with "Erro de autenticação. Faça login novamente." and a login button when `progressError` is set
- [ ] 5.4 Ensure modules list still renders even when progress fetch fails

## 6. Backend Tests

- [ ] 6.1 Write test: refresh endpoint returns new tokens with 24h expiry
- [ ] 6.2 Write test: refresh endpoint rejects expired refresh token
- [ ] 6.3 Write test: access token with 24h expiry works on authenticated endpoint

## 7. Frontend Tests

- [ ] 7.1 Write test: `request()` retries original call after successful refresh
- [ ] 7.2 Write test: `request()` clears tokens and redirects to /login when refresh fails
- [ ] 7.3 Write test: AuthContext `isAuthenticated` is true after me() succeeds
- [ ] 7.4 Write test: AuthContext `isAuthenticated` is false when no token exists
- [ ] 7.5 Write test: Dashboard shows error message when progress fetch fails with 401
- [ ] 7.6 Write test: Dashboard still renders modules when progress fetch fails
