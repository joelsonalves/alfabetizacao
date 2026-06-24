# keyboard-accent-normalization Specification

## Purpose
TBD - created by archiving change keyboard-accent-handling. Update Purpose after archive.
## Requirements
### Requirement: Keyboard input accepts accented characters without accent

The system SHALL normalize both the pressed key and the expected character using NFD decomposition and diacritic removal before comparing, so that pressing an unaccented letter matches its accented equivalent.

#### Scenario: Unaccented A matches accented Á

- **WHEN** the expected character is `"Á"` and the user presses the `A` key on the physical keyboard (producing `event.key = "A"`)
- **THEN** the system SHALL accept the input as correct, SHALL store `"Á"` in `typedChars`, and SHALL NOT increment the error count

#### Scenario: Unaccented E matches accented É, Ê

- **WHEN** the expected character is `"É"` or `"Ê"` and the user presses the `E` key
- **THEN** the system SHALL accept the input as correct and store the expected accented character

#### Scenario: Unaccented O matches accented Ó, Ô, Õ

- **WHEN** the expected character is `"Ó"`, `"Ô"`, or `"Õ"` and the user presses the `O` key
- **THEN** the system SHALL accept the input as correct and store the expected accented character

#### Scenario: Unaccented U matches accented Ú, Ü

- **WHEN** the expected character is `"Ú"` or `"Ü"` and the user presses the `U` key
- **THEN** the system SHALL accept the input as correct and store the expected accented character

#### Scenario: Unaccented I matches accented Í

- **WHEN** the expected character is `"Í"` and the user presses the `I` key
- **THEN** the system SHALL accept the input as correct and store the expected accented character

#### Scenario: C matches Ç

- **WHEN** the expected character is `"Ç"` and the user presses the `C` key
- **THEN** the system SHALL accept the input as correct and store `"Ç"` in `typedChars`

### Requirement: Accent normalization preserves display correctness

The system SHALL store the expected (accented) character in `typedChars` when the user presses the unaccented equivalent, so the visual display shows the correctly accented word.

#### Scenario: SOFÁ displays correctly after typing SOFA

- **WHEN** the lesson target is `"SOFÁ"` and the user presses `S`, `O`, `F`, `A` (where the last `A` matches `Á` via normalization)
- **THEN** the display SHALL show `"SOFÁ"` (with accent), not `"SOFA"` (without accent)
- **AND** the lesson SHALL be marked as completed

### Requirement: Normalization does not change unaccented matching

The system SHALL continue to match unaccented characters exactly as before, with no false positives or regressions.

#### Scenario: Unaccented target continues to match exactly

- **WHEN** the lesson target is `"CASA"` and the user presses `C`, `A`, `S`, `A`
- **THEN** each key SHALL match the expected character exactly (no normalization overhead changes behavior)
- **AND** the lesson SHALL be marked as completed

#### Scenario: Wrong letter still produces error

- **WHEN** the expected character is `"Á"` and the user presses `B`
- **THEN** the system SHALL reject the input as incorrect, SHALL increment the error count, and SHALL record `lastWrongKey = "B"`

