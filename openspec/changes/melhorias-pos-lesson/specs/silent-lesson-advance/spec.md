# Silent Lesson Advance

## ADDED Requirements

### Requirement: No TTS is spoken when advancing to next lesson

The system SHALL NOT speak any letter, syllable, word, phrase, or sentence via TTS when the lesson completion effect runs or when the user clicks "Próxima Lição".

#### Scenario: Word lesson does not speak target on completion

- **WHEN** a word-type lesson is completed (`canComplete` becomes true)
- **THEN** the system SHALL NOT call `speakWord()` or any other TTS function for the completed lesson's target

#### Scenario: Letter lesson does not speak target on completion

- **WHEN** a letter-type lesson is completed (`canComplete` becomes true)
- **THEN** the system SHALL NOT call `speakLetter()` or `speakLetterWithWord()` or any other TTS function

#### Scenario: Clicking "Próxima Lição" does not trigger TTS

- **WHEN** the user clicks the "Próxima Lição" button
- **THEN** the system SHALL NOT call any TTS function
