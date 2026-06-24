# learning-modules Specification

## Purpose
TBD - created by archiving change alfabetizacao-multissensorial. Update Purpose after archive.
## Requirements
### Requirement: Learning progression
The system SHALL provide 7 progressive learning levels: vowels, consonants, simple syllables, complex syllables, words, phrases, sentences.

#### Scenario: Level access
- **WHEN** user completes all lessons in current level
- **THEN** next level is unlocked

#### Scenario: First level always available
- **WHEN** user accesses learning modules for the first time
- **THEN** Level 1 (vowels) is unlocked by default

### Requirement: Lesson content
Each lesson SHALL contain: instruction text, target content (letter/syllable/word), audio playback, and typing practice.

#### Scenario: Lesson load
- **WHEN** user opens a lesson
- **THEN** system displays instruction, plays audio of the target, and shows the virtual keyboard

### Requirement: Vowels level
Level 1 SHALL teach A, E, I, O, U individually with audio and typing practice.

#### Scenario: Vowel practice
- **WHEN** user is on vowel lesson for "A"
- **THEN** system shows letter "A", plays "A" sound, and waits for user to type "A"

### Requirement: Consonants level
Level 2 SHALL teach consonants with associated images (Bola for B, Casa for C, etc.).

#### Scenario: Consonant with image
- **WHEN** user is on consonant lesson for "B"
- **THEN** system shows letter "B" with image of "Bola" and plays the consonant sound

### Requirement: Simple syllables level
Level 3 SHALL teach CV syllables (BA, BE, BI, BO, BU, etc.) with images of words containing them.

#### Scenario: Syllable practice
- **WHEN** user types "B" then "A"
- **THEN** system plays combined syllable sound "BA" and shows image of "BALA"

### Requirement: Complex syllables level
Level 4 SHALL teach CCV and CVC syllables (BRA, CRE, CAR, PAL, etc.).

#### Scenario: Complex syllable practice
- **WHEN** user types complex syllable "BRA"
- **THEN** system plays "BRA" sound and shows image of "BRAÇO"

### Requirement: Words level
Level 5 SHALL teach 2-3 syllable words with images and audio.

#### Scenario: Word practice
- **WHEN** user types all letters of "CASA"
- **THEN** system plays "CASA" sound and shows image of a house

### Requirement: Phrases level
Level 6 SHALL teach short phrases with contextual images.

#### Scenario: Phrase practice
- **WHEN** user types complete phrase "O GATO BEBE"
- **THEN** system plays the full phrase and shows scene image

### Requirement: Sentences level
Level 7 SHALL teach complete sentences with contextual images.

#### Scenario: Sentence practice
- **WHEN** user types the full sentence
- **THEN** system plays the sentence audio and shows contextual image

