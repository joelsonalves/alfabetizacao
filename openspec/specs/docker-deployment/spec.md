# docker-deployment Specification

## Purpose
TBD - created by archiving change alfabetizacao-multissensorial. Update Purpose after archive.
## Requirements
### Requirement: Docker Compose setup
The system SHALL provide a docker-compose.yml with three services: postgres, backend, frontend.

#### Scenario: Service startup
- **WHEN** user runs `docker-compose up -d`
- **THEN** PostgreSQL, backend API, and frontend Nginx start in containers

### Requirement: PostgreSQL container
The database SHALL run in a container with persistent volume and health check.

#### Scenario: Database persistence
- **WHEN** containers are restarted
- **THEN** PostgreSQL data persists via Docker volume

### Requirement: Backend container
The backend SHALL run FastAPI via Uvicorn with environment variables for configuration.

#### Scenario: Backend startup
- **WHEN** backend container starts
- **THEN** Uvicorn serves FastAPI on port 8000 and runs Alembic migrations

### Requirement: Frontend container
The frontend SHALL be served by Nginx with static assets and proxy pass to backend API.

#### Scenario: Frontend routing
- **WHEN** user accesses the application via browser
- **THEN** Nginx serves React static files and proxies /api/* requests to backend

