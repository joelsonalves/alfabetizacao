# help-button-tts Specification

## Purpose
TBD - created by archiving change melhorias-pos-lesson. Update Purpose after archive.
## Requirements
### Requirement: HelpButton reads dica aloud via TTS when opened

The system SHALL speak the help tip content (title and text) aloud via TTS when the user opens the floating help tooltip.

#### Scenario: TTS speaks the help tip when tooltip opens

- **WHEN** the user clicks the floating `?` button and the help tooltip opens
- **THEN** the system SHALL speak `"{tip.title}: {tip.text}"` aloud via TTS (e.g., `"Lição: Digite a letra, sílaba ou palavra mostrada na tela."`)

#### Scenario: TTS stops when tooltip closes

- **WHEN** the user closes the help tooltip (via click, Escape key, or clicking the tooltip area)
- **THEN** the system SHALL stop any ongoing TTS speech using `window.speechSynthesis.cancel()`

#### Scenario: TTS only fires on open transition

- **WHEN** the help tooltip is already open and the user clicks the button again to close it
- **THEN** the system SHALL NOT speak the tip again (only speaks on the open transition)

