## ADDED Requirements

### Requirement: Progress persistence
The system SHALL save user progress to PostgreSQL after each lesson completion.

#### Scenario: Save on completion
- **WHEN** user completes a lesson
- **THEN** system saves score, stars, and completion status to database

### Requirement: Progress restoration
The system SHALL restore user's last position when they log in again.

#### Scenario: Resume lesson
- **WHEN** user logs in after previous session
- **THEN** system displays the next incomplete lesson as the starting point

### Requirement: Progress dashboard
The system SHALL show a visual dashboard of overall progress across all levels.

#### Scenario: Dashboard display
- **WHEN** user views their profile or dashboard
- **THEN** system shows progress bars for each level, total XP, stars collected, and achievements

### Requirement: Session history
The system SHALL track session duration and activity for analytics.

#### Scenario: Session tracking
- **WHEN** user is logged in and active
- **THEN** system records session start time and calculates duration
