## ADDED Requirements

### Requirement: User registration
The system SHALL allow new users to register with name, email and password.

#### Scenario: Successful registration
- **WHEN** user submits registration form with valid name, email and password
- **THEN** system creates user account and returns JWT token

#### Scenario: Duplicate email
- **WHEN** user submits registration with an existing email
- **THEN** system returns error "Email already registered"

### Requirement: User login
The system SHALL authenticate users with email and password, returning JWT token.

#### Scenario: Successful login
- **WHEN** user submits valid email and password
- **THEN** system returns JWT token with user info

#### Scenario: Invalid credentials
- **WHEN** user submits incorrect email or password
- **THEN** system returns 401 error

### Requirement: Session management
The system SHALL validate JWT tokens on protected routes and refresh expired tokens.

#### Scenario: Valid token access
- **WHEN** user makes request with valid JWT token
- **THEN** system processes the request

#### Scenario: Expired token
- **WHEN** user makes request with expired JWT token
- **THEN** system returns 401 and prompts re-login
