# manual-speech-stop Specification

## Purpose
TBD - created by archiving change manual-speech-stop. Update Purpose after archive.
## Requirements
### Requirement: Microphone button toggles between ready and listening states

The system SHALL provide a single microphone button that toggles between two states: ready to speak (idle) and listening. The button SHALL NOT be disabled while listening — the user SHALL be able to click it to stop recognition at any time.

#### Scenario: Button shows "Ler em voz alta" when ready
- **WHEN** the microphone is not listening
- **THEN** the button SHALL display `🎤 Ler em voz alta`
- **AND** the button SHALL contain a badge `[2]`
- **AND** clicking the button SHALL start speech recognition

#### Scenario: Button shows "Terminei de ler" while listening
- **WHEN** the microphone is listening
- **THEN** the button SHALL display `🛑 Terminei de ler`
- **AND** the button SHALL contain a badge `[2]`
- **AND** clicking the button SHALL stop speech recognition

#### Scenario: Toggle returns to ready state after listening ends
- **WHEN** speech recognition ends (by user click, timeout, or browser end-of-speech detection)
- **THEN** the button SHALL return to `🎤 Ler em voz alta` state

### Requirement: Ouvir button shows numbered badge [1]

The "Ouvir" button SHALL display a circular badge with the number 1 to indicate it is the first step in the audio sequence.

#### Scenario: Ouvir shows badge [1] at all times
- **WHEN** the lesson has speech recognition and TTS support
- **THEN** the "Ouvir" button SHALL display `🔊 Ouvir` followed by a badge `[1]`

### Requirement: Buttons have consistent size, border and hover

Both the "Ouvir" and "Ler em voz alta" / "Terminei de ler" buttons SHALL have the same minimum width, padding, visible border, and hover effect.

#### Scenario: Buttons are visually consistent
- **WHEN** both buttons are rendered in the speech-actions container
- **THEN** both buttons SHALL have `min-width: 200px`
- **AND** both buttons SHALL have a visible 1px border
- **AND** both buttons SHALL change background on hover to the same color

### Requirement: Manual stop does not show error message

When the user explicitly clicks the button to stop listening, the system SHALL NOT display a "Não entendi" or any error message, even if no speech was captured.

#### Scenario: Click stop before speaking
- **WHEN** the user clicks `🎤 Ler em voz alta`
- **AND** the button changes to `🛑 Terminei de ler`
- **AND** the user clicks `🛑 Terminei de ler` without speaking
- **THEN** the listening state SHALL end
- **AND** no error message SHALL be displayed
- **AND** the button SHALL return to `🎤 Ler em voz alta`

#### Scenario: Click stop after speaking
- **WHEN** the user speaks and clicks `🛑 Terminei de ler`
- **AND** speech was already captured
- **THEN** the transcript SHALL be processed normally (onresult fires)
- **AND** no "Não entendi" message SHALL be shown

### Requirement: Timeout is configurable per lesson type

The speech recognition timeout SHALL vary by lesson type to accommodate different utterance lengths. If the timeout expires before any speech is captured, the system SHALL display "Não entendi" as before.

#### Scenario: Letter/consonant lesson uses 4-second timeout
- **WHEN** the lesson type is `letter` or `consonant`
- **AND** the user clicks `🎤 Ler em voz alta`
- **AND** no speech is detected within 4 seconds
- **THEN** the system SHALL display "Não entendi" feedback

#### Scenario: Syllable lesson uses 6-second timeout
- **WHEN** the lesson type is `syllable`
- **AND** no speech is detected within 6 seconds
- **THEN** timeout SHALL expire and show "Não entendi"

#### Scenario: Word lesson uses 8-second timeout
- **WHEN** the lesson type is `word`
- **AND** no speech is detected within 8 seconds
- **THEN** timeout SHALL expire and show "Não entendi"

#### Scenario: Sentence/phrase lesson uses 20-second timeout
- **WHEN** the lesson type is `sentence` or `phrase`
- **AND** no speech is detected within 20 seconds
- **THEN** timeout SHALL expire and show "Não entendi"

### Requirement: stopListening suppresses onNoResult when triggered manually

The `useSpeechRecognition` hook SHALL distinguish between automatic timeout and manual stop. When `stopListening()` is called, the hook SHALL mark the stop as manual and suppress the `onNoResult` callback in `onend`.

#### Scenario: Manual stop does not fire onNoResult
- **WHEN** `stopListening()` is called
- **AND** `onend` fires with `hasResult = false`
- **THEN** `onNoResult` SHALL NOT be called

#### Scenario: Timeout still fires onNoResult
- **WHEN** the internal timeout expires
- **AND** `hasResult = false`
- **THEN** `onNoResult` SHALL be called as before

