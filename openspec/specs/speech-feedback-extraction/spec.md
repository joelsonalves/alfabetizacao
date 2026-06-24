# speech-feedback-extraction Specification

## Purpose
TBD - created by archiving change corrigir-feedback-fala. Update Purpose after archive.
## Requirements
### Requirement: extractSpokenContent extracts relevant content from ASR transcript

The system SHALL provide a function `extractSpokenContent(transcript, target, sounds)` that extracts the meaningful spoken content from the raw ASR transcript, stripping prefixes and noise, and returning an object `{ content: string, isCorrect: boolean }`.

#### Scenario: Extracts exact target when transcript contains only the target

- **WHEN** the transcript is `"B"` and the target is `"B"`
- **THEN** `extractSpokenContent` returns `{ content: "B", isCorrect: true }`

#### Scenario: Strips prefix and returns target

- **WHEN** the transcript is `"LETRA B"` and the target is `"B"`
- **THEN** `extractSpokenContent` returns `{ content: "B", isCorrect: true }`

#### Scenario: Handles misrecognized sound like "bairro" for "B"

- **WHEN** the transcript is `"LETRA BAIRRO"` and the target is `"B"` and the sounds map has `B` mapped to `bê`
- **THEN** `extractSpokenContent` returns `{ content: "B", isCorrect: true }`
- **AND** the `content` field MUST be the extracted target (`"B"`), not the raw transcript word (`"BAIRRO"`)

#### Scenario: Handles lowercase transcript

- **WHEN** the transcript is `"letra b"` and the target is `"B"`
- **THEN** `extractSpokenContent` returns `{ content: "B", isCorrect: true }`

#### Scenario: Returns isCorrect false when transcript does not match target

- **WHEN** the transcript is `"LETRA CASA"` and the target is `"B"`
- **THEN** `extractSpokenContent` returns `{ content: "CASA", isCorrect: false }`

#### Scenario: Returns fallback when extraction yields empty string

- **WHEN** the transcript is `""` and the target is `"B"`
- **THEN** `extractSpokenContent` returns `{ content: "", isCorrect: false }`

### Requirement: Feedback displays extracted content instead of raw transcript

The system SHALL display the extracted `content` (not the raw transcript) in the audio feedback message shown to the user during a lesson.

#### Scenario: Correct answer shows extracted content as success

- **WHEN** the user speaks a correct letter, the ASR returns a noisy transcript, and `extractSpokenContent` returns `isCorrect: true` with `content` set to the target
- **THEN** the feedback displayed MUST use the extracted `content`, resulting in a message like `"Falou: B ✅ (esperado: B)"` instead of showing the raw transcript

#### Scenario: Incorrect answer shows extracted content as failure

- **WHEN** the user speaks an incorrect letter, the ASR returns a noisy transcript, and `extractSpokenContent` returns `isCorrect: false` with `content` set to the extracted word
- **THEN** the feedback displayed MUST use the extracted `content`, resulting in a message like `"Falou: CASA ❌ (esperado: B)"`

### Requirement: TTS speaks structured feedback messages using displayTarget

The system SHALL use structured, pre-defined messages for TTS output, using the lesson's `displayTarget` (from the database, not from the ASR transcript) to provide clear and unambiguous audio feedback.

#### Scenario: TTS on correct answer uses structured message with displayTarget

- **WHEN** the user speaks a correct answer and `extractSpokenContent` returns `isCorrect: true`
- **THEN** the TTS output MUST be `"Muito bem! Você acertou a letra {displayTarget}."` where `displayTarget` is the lesson's target from the database (e.g., `"Muito bem! Você acertou a letra B."`)

#### Scenario: TTS on incorrect answer uses structured message with displayTarget

- **WHEN** the user speaks an incorrect answer and `extractSpokenContent` returns `isCorrect: false`
- **THEN** the TTS output MUST be `"Quase! Tente novamente. A letra é {displayTarget}."` where `displayTarget` is the lesson's target from the database (e.g., `"Quase! Tente novamente. A letra é B."`)

### Requirement: Prefix stripping no longer leaves trailing spaces

The system SHALL ensure that after stripping known prefixes (e.g., "LETRA", "A LETRA", "A SÍLABA"), the remaining string does not contain leading or trailing whitespace.

#### Scenario: Prefix stripped with trailing space is trimmed

- **WHEN** a transcript starts with a known prefix followed by a space, and the prefix is stripped
- **THEN** the resulting string MUST NOT have leading or trailing whitespace (i.e., `.trim()` is applied)

