## ADDED Requirements

### Requirement: FeatureFlagsContext provides flags app-wide

A React context `FeatureFlagsContext` SHALL be created that:
- Fetches `GET /feature-flags` on app mount
- Stores the flags as `Map<string, { active: boolean, behavior_on_inactive: string }>`
- Provides a helper `isActive(key)` and `getBehavior(key)`
- Provides a `refresh()` function to re-fetch

#### Scenario: Flags are fetched on mount
- **WHEN** the app loads and user is authenticated
- **THEN** `GET /feature-flags` is called
- **AND** the flags are stored in context

#### Scenario: isActive returns correct value
- **WHEN** `flag[key].active === true`
- **THEN** `isActive(key)` SHALL return `true`

### Requirement: AdminRoute protects /admin

A component `<AdminRoute>` SHALL check `user.is_admin` from `useAuth()`. If not admin, redirect to `/dashboard`.

#### Scenario: Non-admin redirected
- **WHEN** a non-admin user navigates to `/admin`
- **THEN** they SHALL be redirected to `/dashboard`

#### Scenario: Admin sees admin page
- **WHEN** an admin user navigates to `/admin`
- **THEN** the Admin page SHALL render

### Requirement: Admin page lists all flags with toggles

The `/admin` page SHALL:
- Fetch `GET /admin/feature-flags` on mount
- Display each flag as a row with: key, description, active toggle switch, behavior selector ("hidden" | "locked")
- Toggle switch calls `PATCH /admin/feature-flags/{key}`
- Show success/error feedback
- Have a refresh button

#### Scenario: Admin page shows all flags
- **WHEN** admin accesses `/admin`
- **THEN** all 11 flags are displayed in a table/list
- **AND** each row has a toggle switch reflecting the current `active` state

#### Scenario: Toggle updates flag
- **WHEN** admin clicks a toggle switch
- **THEN** `PATCH /admin/feature-flags/{key}` is called with the new active state
- **AND** the toggle reflects the new state after response

### Requirement: Dashboard filters modules by feature flags

The Dashboard SHALL:
- Read flags from `FeatureFlagsContext`
- For each module with a matching `module.<type>` flag:
  - If `active === true`: render normally
  - If `active === false && behavior === "hidden"`: do not render
  - If `active === false && behavior === "locked"`: render with locked styling, disabled click, tooltip "Recurso desativado pelo administrador"

#### Scenario: Hidden module does not appear
- **WHEN** `module.vowel` has `active: false, behavior: "hidden"`
- **THEN** the Vogais card SHALL NOT appear in the Dashboard

#### Scenario: Locked module appears disabled
- **WHEN** `module.vowel` has `active: false, behavior: "locked"`
- **THEN** the Vogais card SHALL appear with a lock icon
- **AND** clicking it SHALL NOT navigate to lessons
- **AND** a tooltip "Recurso desativado pelo administrador" SHALL be shown

### Requirement: HelpButton checks feature flag

The `HelpButton` component SHALL check `isActive('feature.help_button')` from context. If not active, SHALL render nothing.

#### Scenario: HelpButton hidden when flag is off
- **WHEN** `feature.help_button` has `active: false`
- **THEN** the HelpButton SHALL NOT render in the DOM

### Requirement: LevelUp checks feature flag

The `LevelUp` component SHALL check `isActive('feature.level_up')` from context. If not active, SHALL NOT render even when triggered.

#### Scenario: LevelUp suppressed when flag is off
- **WHEN** `feature.level_up` has `active: false`
- **THEN** completing a lesson SHALL NOT show the LevelUp modal

### Requirement: Tutorial checks feature flag

The Tutorial page SHALL redirect to `/dashboard` if `feature.tutorial` is not active.

#### Scenario: Tutorial blocked when flag is off
- **WHEN** `feature.tutorial` has `active: false`
- **THEN** navigating to `/tutorial` SHALL redirect to `/dashboard`

### Requirement: Navigation shows Admin link for admins

The `Layout` component SHALL show an "Admin" link in the navigation when `user.is_admin === true`.

#### Scenario: Admin sees admin link
- **WHEN** `user.is_admin === true`
- **THEN** the navigation SHALL contain a link to `/admin`

#### Scenario: Non-admin does not see admin link
- **WHEN** `user.is_admin === false`
- **THEN** the navigation SHALL NOT contain an Admin link
