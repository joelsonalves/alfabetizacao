# speech-recognition Specification

## Purpose
TBD - created by archiving change alfabetizacao-multissensorial. Update Purpose after archive.
## Requirements
### Requirement: Speech recognition for pronunciation
The system SHALL use Web Speech Recognition API to let users practice pronunciation of letters, syllables and words.

#### Scenario: Start recording
- **WHEN** user clicks microphone button
- **THEN** system starts listening via Web Speech Recognition in PT-BR

#### Scenario: Correct pronunciation
- **WHEN** user speaks the target letter/syllable/word correctly
- **THEN** system registers success and gives positive feedback

#### Scenario: Incorrect pronunciation
- **WHEN** user speaks something different from target
- **THEN** system shows gentle correction feedback and offers retry

### Requirement: Microphone permission handling
The system SHALL request and handle microphone permission gracefully.

#### Scenario: Permission granted
- **WHEN** user grants microphone access
- **THEN** speech recognition is activated

#### Scenario: Permission denied
- **WHEN** user denies microphone access
- **THEN** speech recognition is disabled and option is hidden, system continues with typing only

### Requirement: Browser compatibility fallback
The system SHALL detect if Web Speech Recognition is available and disable feature if not.

#### Scenario: Unsupported browser
- **WHEN** browser does not support Web Speech Recognition
- **THEN** microphone button is hidden and system works with typing + audio only

