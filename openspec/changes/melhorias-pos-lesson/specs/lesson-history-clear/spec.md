# Lesson History Clear

## ADDED Requirements

### Requirement: Feedback history is cleared when navigating to a new lesson

The system SHALL clear the `feedbacks` array when the user navigates from one lesson to another, ensuring that feedback messages (keyboard, speech, and other activity logs) from the previous lesson are not visible in the new lesson.

#### Scenario: Feedbacks from previous lesson are not shown in new lesson

- **WHEN** the user completes a lesson (e.g., consoante D) and navigates to the next lesson (e.g., consoante F) via "Próxima Lição" or nav menu click
- **THEN** the feedback list in the new lesson SHALL be empty, showing only feedbacks generated during the new lesson

#### Scenario: Feedbacks are preserved within the same lesson

- **WHEN** the user performs actions within a single lesson (types keys, speaks, etc.)
- **THEN** the feedback list SHALL continue to accumulate feedbacks as normal (respecting the existing max limit of 5 entries via `.slice(-4)`)
