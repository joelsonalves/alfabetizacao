## Why

The Dashboard page is unusable when `GET /api/progress` returns 401 Unauthorized — the user sees a blank/loading page with no data and no clear error message. This has been observed in console logs during normal usage, indicating the JWT auth flow is unreliable. The root cause is unknown but suspected to be one of: expired access token with failed refresh, race condition in AuthContext initialization, or missing auth header.

## What Changes

- Add diagnostic logging to trace the exact auth flow during Dashboard load (token existence, expiry, refresh attempts, me() response).
- Fix the root cause of the 401 on `/api/progress` — likely adjustments to the token refresh logic, access token TTL, or auth context initialization.
- Add automated tests to cover the refresh flow and prevent regression.
- Ensure the Dashboard handles auth failures gracefully (shows a meaningful message instead of a blank screen).

## Capabilities

### New Capabilities
- `auth-refresh-flow`: Covers the full JWT token lifecycle — creation, refresh, race-condition handling, and error recovery. Ensures authenticated API calls succeed reliably and failures are communicated to the user.

### Modified Capabilities
- *(none — no existing specs are changing)*

## Impact

- **Backend**: `backend/app/routes/auth.py` (token expiry config, refresh endpoint), `backend/app/services/auth.py` (token creation)
- **Frontend**: `frontend/src/services/api.js` (refresh subscriber logic, 401 handling), `frontend/src/context/AuthContext.jsx` (initialization flow)
- **Frontend**: `frontend/src/pages/Dashboard.jsx` (error handling for failed progress fetch)
- **Tests**: New backend tests for token refresh endpoint, new frontend tests for `request()` refresh retry logic
