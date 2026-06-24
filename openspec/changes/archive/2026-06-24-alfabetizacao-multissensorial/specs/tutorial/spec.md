## ADDED Requirements

### Requirement: First-access tutorial
The system SHALL present a guided tutorial on first login with text and audio narration.

#### Scenario: Tutorial trigger
- **WHEN** user logs in for the first time
- **THEN** system starts the guided tutorial automatically

#### Scenario: Tutorial steps
- **WHEN** tutorial is active
- **THEN** system highlights each UI element (keyboard, lesson area, progress) and explains it with text + TTS audio

#### Scenario: Tutorial completion
- **WHEN** user completes all tutorial steps
- **THEN** system marks tutorial as seen and does not show it again

### Requirement: Tutorial replay
The system SHALL allow users to replay the tutorial from settings.

#### Scenario: Replay
- **WHEN** user clicks "Ajuda" or "Tutorial" button
- **THEN** system replays the full tutorial

### Requirement: Inline help
Each lesson screen SHALL have context-sensitive help available.

#### Scenario: Help tooltip
- **WHEN** user clicks "?" icon on any screen
- **THEN** system shows a tooltip explaining the current screen's purpose and controls
