## ADDED Requirements

### Requirement: Virtual keyboard
The system SHALL display a virtual keyboard on screen that highlights the pressed key.

#### Scenario: Key press visual feedback
- **WHEN** user presses a key on physical keyboard
- **THEN** corresponding virtual key is highlighted with animation

#### Scenario: Virtual key click
- **WHEN** user clicks a key on virtual keyboard
- **THEN** system processes the key as if pressed on physical keyboard

### Requirement: Keyboard layout
The system SHALL support ABNT2 keyboard layout (Brazilian Portuguese).

#### Scenario: Layout display
- **WHEN** virtual keyboard is rendered
- **THEN** it SHALL display ABNT2 layout with correct key positions

### Requirement: Typing detection
The system SHALL detect which letter/syllable/word the user needs to type based on current lesson.

#### Scenario: Correct key
- **WHEN** user pressed the correct key for current lesson target
- **THEN** system registers success and advances

#### Scenario: Incorrect key
- **WHEN** user presses wrong key
- **THEN** system shows visual error feedback and plays no sound
