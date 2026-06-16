## Context

The Dashboard page (`/dashboard`) fetches user progress via `api.progress.get()` (`GET /api/progress`) immediately on mount via `useEffect`. This endpoint requires authentication via the `get_current_user` FastAPI dependency. The frontend attaches a JWT access token from `localStorage` as a `Bearer` header.

The 401 error indicates the backend rejected the token. Possible causes:

1. **No token in localStorage** — user never logged in, or tokens were cleared.
2. **Expired access token** — current TTL is 15 minutes. If the user returns after 15+ min, the token is invalid.
3. **Failed refresh** — the `request()` function attempts to refresh on 401, but if the refresh token is also expired (7 day TTL) or the refresh call fails, tokens are cleared and user is redirected.
4. **Race condition in AuthContext** — `ProtectedRoute` may render the Dashboard before `api.auth.me()` completes, using a stale token.
5. **Token signed with different SECRET_KEY** — environment mismatch between containers.

The modules list endpoint (`GET /api/modules`) works because it has **no** auth requirement — confirming the issue is specifically in the auth layer.

## Goals / Non-Goals

**Goals:**
- Identify the exact root cause of the 401 on `GET /api/progress` for the reported scenario.
- Fix the root cause so authenticated API calls succeed reliably.
- Add observability to trace auth flow issues in the future.
- Gracefully handle auth failures in the Dashboard (show message, not blank screen).

**Non-Goals:**
- Redesign the entire auth system (token format, refresh strategy, etc.).
- Add social login, OAuth, or other auth providers.
- Change the backend's `get_current_user` dependency pattern.
- Performance optimization of the auth flow.

## Decisions

### Decision 1: Diagnostic-first approach — add logging before any fix
- **Choice**: Add structured logging to both frontend and backend to trace the complete auth flow, then fix based on evidence.
- **Rationale**: The root cause is unconfirmed. Guessing would risk fixing the wrong thing. Logging at key decision points will reveal the actual failure mode.
- **Alternatives considered**:
  - Fix the most likely cause (short 15-min TTL) blindly — rejected because TTL may not be the issue.
  - Add only frontend logging — rejected because we need both sides to correlate.

### Decision 2: Increase access token TTL from 15 min to 24 hours
- **Choice**: Set access token expiry to 24 hours (matching `settings.jwt_expiry_hours` default) in both `login` and `refresh` endpoints.
- **Rationale**: 15 minutes is unnecessarily short for a literacy learning app. Users may take breaks mid-lesson. A 24-hour TTL reduces unnecessary refresh cycles without meaningful security risk (this is not a banking app).
- **Alternatives considered**:
  - Keep 15 min and improve the refresh flow — possible but adds complexity without user benefit.
  - Keep the TTL mismatch (15 min in code, 24h in config) — this is the current state and is clearly a bug.

### Decision 3: Fix race condition in AuthContext initialization
- **Choice**: Ensure `AuthContext` completes its initial auth check (`me()` or `refresh()`) before the Dashboard is rendered, by adding an explicit `ready` guard in the context value.
- **Rationale**: `ProtectedRoute` already waits for `loading === false`, but if `me()` fails silently while `user` is still null, the route could redirect or render before auth is truly resolved. The fix ensures the context exposes a clear `isAuthenticated` state that cannot be misinterpreted.
- **Alternatives considered**:
  - Keep current `{ user, loading }` pattern — it works but is fragile if `user` is null for reasons other than "not logged in".
  - Add `authInitialized` flag — same idea, slightly different naming.

### Decision 4: Dashboard handles auth errors gracefully
- **Choice**: If `api.progress.get()` fails with 401, show an inline message "Erro de autenticação. Faça login novamente." with a login button, rather than a blank/loading page.
- **Rationale**: Even after the fix, edge cases (e.g., token revoked by admin) can still cause 401. The user should never see a blank screen.
- **Alternatives considered**:
  - Redirect to login on any 401 — too aggressive; a transient error would lose user state.
  - Silence the error — bad UX; user should know something needs attention.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Increasing TTL to 24h extends the window for stolen token abuse | Acceptable for this app context (educational, non-financial). Logout still revokes via TokenBlocklist. |
| Adding logging could expose sensitive data (token values) in production | Log only "token exists" boolean and token prefix, never full token. |
| Race condition fix may introduce regression in login/redirect flow | Write tests covering: fresh login → dashboard loads, expired token → auto-refresh, no token → redirect to login. |
| The diagnostic phase may not reproduce the bug (intermittent) | Add logging to every auth decision point and instruct user to reproduce, then check logs. |
