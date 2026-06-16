# Result Auto Focus

## ADDED Requirements

### Requirement: "Próxima Lição" button receives keyboard focus on appear

The system SHALL automatically move keyboard focus to the "Próxima Lição" button when the lesson result screen (`showResult`) is displayed.

#### Scenario: Focus moves to Next Lesson button when result appears

- **WHEN** the lesson result screen appears (e.g., after the progress API call succeeds or fails)
- **THEN** the "Próxima Lição" button SHALL receive keyboard focus
- **AND** pressing the Enter key SHALL trigger `nextLesson()`

#### Scenario: Focus does not conflict with LevelUp modal

- **WHEN** both `showResult` and `levelUp` are displayed simultaneously
- **THEN** the focus SHOULD remain on the LevelUp modal to avoid confusion (the modal has its own close/dismiss behavior)
