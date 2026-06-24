# image-assets Specification

## Purpose
TBD - created by archiving change alfabetizacao-multissensorial. Update Purpose after archive.
## Requirements
### Requirement: Images for consonants
Each consonant SHALL have an associated emoji/SVG image representing a word that starts with that letter.

#### Scenario: Consonant image display
- **WHEN** user is on consonant lesson for "B"
- **THEN** system displays the associated emoji/image (🏀 Bola) alongside the letter

#### Scenario: All consonants mapped
- **WHEN** any consonant lesson is accessed
- **THEN** system SHALL display its associated image: A (🍎), B (🏀), C (🐱), D (🎲), E (⭐), F (🔥), G (🎸), H (🏠), I (🍦), J (🤹), K (🥝), L (🍋), M (🌙), N (🔵), O (👁️), P (🐧), Q (🧀), R (🌈), S (☀️), T (🎵), U (☂️), V (🎻), W (🐺), X (❌), Y (🪀), Z (🦓)

### Requirement: Images for words and phrases
Words and phrases SHALL display real images (Unsplash API or local fallback) representing their meaning.

#### Scenario: Word image
- **WHEN** user completes word "CASA"
- **THEN** system SHALL display an image of a house

#### Scenario: Phrase image
- **WHEN** user completes phrase "O GATO BEBE"
- **THEN** system SHALL display a contextual scene image

### Requirement: Image caching
The system SHALL cache fetched images to avoid repeated API calls.

#### Scenario: Cached image
- **WHEN** user accesses same word or phrase again
- **THEN** system serves cached image instead of re-fetching

