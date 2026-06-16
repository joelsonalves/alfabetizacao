# frontend-test-coverage Specification

## Purpose
TBD - created by archiving change ampliar-cobertura-testes. Update Purpose after archive.
## Requirements
### Requirement: Layout component must be tested
The Layout component SHALL have tests covering navigation, authentication state, and accessibility.

#### Scenario: Renders navigation when user is logged in
- **WHEN** the Layout renders with a logged-in user
- **THEN** it SHALL display navigation links (Início, Perfil, Ajuda, Sair)
- **AND** SHALL display the user's XP and level

#### Scenario: Hides navigation when user is not logged in
- **WHEN** the Layout renders without a user
- **THEN** it SHALL NOT display navigation links

#### Scenario: Logout button calls logout and navigates
- **WHEN** the Sair button is clicked
- **THEN** `logout` SHALL be called
- **AND** navigation to `/login` SHALL occur

#### Scenario: Skip link is present
- **WHEN** the Layout renders
- **THEN** a skip-link with text "Pular para conteúdo principal" SHALL be present pointing to `#main-content`

### Requirement: HelpButton component must be tested
The HelpButton SHALL have tests covering toggle behavior and keyboard interaction.

#### Scenario: Click toggles tooltip
- **WHEN** the HelpButton is clicked once
- **THEN** the help tooltip SHALL be visible
- **AND** the `aria-expanded` attribute SHALL be set to `true`
- **WHEN** clicked again
- **THEN** the tooltip SHALL be hidden

#### Scenario: Escape key closes tooltip
- **WHEN** the HelpButton tooltip is open and the Escape key is pressed
- **THEN** the tooltip SHALL close

#### Scenario: Shows correct tip for each context
- **WHEN** HelpButton is rendered with `context="lesson"`
- **THEN** it SHALL display the lesson help text
- **WHEN** rendered with `context="dashboard"`
- **THEN** it SHALL display the dashboard help text

### Requirement: ImageDisplay component must be tested
The ImageDisplay SHALL render correctly for each image type and handle missing data.

#### Scenario: Renders emoji
- **WHEN** ImageDisplay receives `type="emoji"` and a `value`
- **THEN** it SHALL render a span with the emoji content

#### Scenario: Renders image
- **WHEN** ImageDisplay receives `type="unsplash"` and a `url`
- **THEN** it SHALL render an img element with the correct src and alt

#### Scenario: Returns null when no data
- **WHEN** ImageDisplay receives no type or url
- **THEN** it SHALL render nothing (return null)

### Requirement: AuthContext refresh flow must be tested
The AuthContext SHALL handle token refresh on startup and failed refresh gracefully.

#### Scenario: Refresh token on startup when token is missing
- **WHEN** AuthContext initializes with a `refresh_token` but no `token` in localStorage
- **THEN** it SHALL call `/auth/refresh` with the stored refresh token
- **AND** SHALL store the new tokens and set the user

#### Scenario: Failed refresh clears storage
- **WHEN** AuthContext initializes and the refresh token API call fails
- **THEN** all tokens SHALL be removed from localStorage
- **AND** the user SHALL be set to null

### Requirement: API service error flows must be tested
The API service SHALL handle 401 refresh, 409 conflict, and retry logic.

#### Scenario: 401 triggers token refresh and retry
- **WHEN** a non-login request returns 401 and a refresh token exists
- **THEN** the service SHALL call `/auth/refresh`
- **AND** SHALL retry the original request with the new token

#### Scenario: 409 conflict returns __conflict object
- **WHEN** a progress update returns HTTP 409
- **THEN** the service SHALL return an object with `__conflict: true` and the error detail

### Requirement: Register page loading and success states must be tested
The Register page SHALL handle loading state and successful registration.

#### Scenario: Shows loading state during registration
- **WHEN** the register form is submitted
- **THEN** the submit button SHALL be disabled
- **AND** SHALL display "Criando..."

#### Scenario: Successful registration navigates to dashboard
- **WHEN** registration succeeds
- **THEN** the user SHALL be redirected to `/dashboard`

### Requirement: Lesson result display must be tested
The Lesson page SHALL display results and error states correctly.

#### Scenario: Displays lesson result on completion
- **WHEN** a lesson is completed (all checklist items done + typing complete)
- **THEN** the result card SHALL appear with "🎉 Lição Completa!" title
- **AND** SHALL display the score and accuracy percentage

#### Scenario: Displays retry error message
- **WHEN** the progress API returns a conflict after retry fails
- **THEN** an error notification SHALL be displayed
- **AND** the lesson result SHALL still be shown

#### Scenario: Displays level up modal
- **WHEN** the progress API response includes a higher level than the current user level
- **THEN** the LevelUp modal SHALL appear with the new level

### Requirement: Profile page loading state must be tested
The Profile page SHALL display a loading indicator while fetching data.

#### Scenario: Shows loading while fetching
- **WHEN** Profile renders and data is still loading
- **THEN** a "Carregando..." message SHALL be displayed

### Requirement: App route protection must be tested
The App SHALL redirect unauthenticated users to the login page.

#### Scenario: Redirects to login when not authenticated
- **WHEN** an unauthenticated user navigates to `/dashboard`
- **THEN** they SHALL be redirected to `/login`

### Requirement: Register form must validate password length client-side
The Register page SHALL validate minimum password length before submission.

#### Scenario: Shows error for short password on submit
- **WHEN** the register form is submitted with a password shorter than 6 characters
- **THEN** an error message SHALL be displayed: "A senha deve ter pelo menos 6 caracteres"
- **AND** the API SHALL NOT be called

