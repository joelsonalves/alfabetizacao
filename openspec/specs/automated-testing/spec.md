# automated-testing Specification

## Purpose
TBD - created by archiving change resolve-lacunas-arquitetura. Update Purpose after archive.
## Requirements
### Requirement: Backend unit tests with pytest
The backend SHALL have unit tests for all route handlers, models, and services using pytest.

#### Scenario: Test route response
- **WHEN** tests are executed with `pytest backend/tests/`
- **THEN** all route handler tests pass with expected HTTP status codes and response bodies

#### Scenario: Test model validation
- **WHEN** model validation tests are executed
- **THEN** SQLAlchemy models create correct database tables and validate required fields

#### Scenario: Test service logic
- **WHEN** service layer tests are executed
- **THEN** business logic (points calculation, level progression, achievement checks) produces correct results

### Requirement: Backend integration tests with httpx
The backend SHALL have integration tests using httpx AsyncClient for API endpoints.

#### Scenario: Test auth flow
- **WHEN** integration tests run register, login, and protected route sequence
- **THEN** the full authentication flow works end-to-end with correct JWT issuance and validation

#### Scenario: Test progress persistence
- **WHEN** integration tests save and retrieve user progress
- **THEN** progress data persists correctly in the test database

#### Scenario: Test database isolation
- **WHEN** tests use a test database or transactions
- **THEN** test data does not leak between test runs

### Requirement: Frontend unit tests with Vitest
The frontend SHALL have unit tests for hooks, components, and services using Vitest.

#### Scenario: Test hook behavior
- **WHEN** Vitest tests execute hook tests
- **THEN** hooks (useAuth, useSpeech, useKeyboard) return correct state and side effects

#### Scenario: Test component rendering
- **WHEN** Vitest tests render components with React Testing Library
- **THEN** components render expected content and respond to user interactions

#### Scenario: Test API service layer
- **WHEN** API service tests execute
- **THEN** HTTP requests are correctly formed and responses are properly parsed

### Requirement: End-to-end tests with Playwright
The system SHALL have e2e tests for critical user flows using Playwright.

#### Scenario: Full learning flow
- **WHEN** Playwright tests execute the complete flow: register → login → complete lesson → earn points
- **THEN** the application behaves correctly in a real browser environment

#### Scenario: Cross-browser compatibility
- **WHEN** e2e tests run on Chromium, Firefox, and WebKit
- **THEN** core functionality works consistently across browsers

### Requirement: Test coverage threshold
The test suite SHALL maintain minimum coverage thresholds.

#### Scenario: Coverage verification
- **WHEN** coverage is measured with pytest-cov and c8/istanbul
- **THEN** backend tests maintain at least 80% coverage and frontend tests at least 70% coverage

