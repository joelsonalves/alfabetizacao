## ADDED Requirements

### Requirement: Structured logging
The backend SHALL use structured logging with structlog, outputting JSON-formatted log entries.

#### Scenario: JSON log output
- **WHEN** the backend processes any request
- **THEN** log entries are written as JSON with fields: timestamp, level, event, request_id, user_id, path, method, duration_ms

#### Scenario: Request correlation
- **WHEN** a request spans multiple operations
- **THEN** all log entries for that request share the same request_id

#### Scenario: Log level configuration
- **WHEN** the LOG_LEVEL environment variable is set
- **THEN** the backend filters logs at that level (DEBUG, INFO, WARNING, ERROR)

### Requirement: Advanced health checks
The backend SHALL provide a detailed health check endpoint.

#### Scenario: Health check response
- **WHEN** GET /api/health is called
- **THEN** response includes status of database connection, disk space, and uptime

#### Scenario: Degraded service
- **WHEN** database connection fails
- **THEN** health check returns HTTP 503 with details of which component is failing

### Requirement: Usage metrics endpoint
The backend SHALL expose basic usage metrics.

#### Scenario: Metrics collection
- **WHEN** GET /api/metrics is called
- **THEN** response includes: total registered users, total lessons completed, total achievements earned, active users today

#### Scenario: Metrics reset
- **WHEN** the server restarts
- **THEN** metrics counters are initialized from database state (not reset to zero)
