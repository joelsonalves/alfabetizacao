# accessibility Specification

## Purpose
TBD - created by archiving change resolve-lacunas-arquitetura. Update Purpose after archive.
## Requirements
### Requirement: Keyboard navigation
All interactive elements SHALL be accessible via keyboard navigation.

#### Scenario: Tab order
- **WHEN** user presses Tab key
- **THEN** focus moves through interactive elements in logical order (top to bottom, left to right)

#### Scenario: Key actions
- **WHEN** user focuses a button or link and presses Enter/Space
- **THEN** the element's action is triggered

#### Scenario: Escape key
- **WHEN** user presses Escape on a modal, tooltip, or tutorial overlay
- **THEN** the overlay closes

#### Scenario: Focus indicator
- **WHEN** any element receives keyboard focus
- **THEN** a visible focus ring (2px solid, high contrast) is displayed around the element

### Requirement: ARIA labels and descriptions
All interactive components SHALL have descriptive ARIA labels.

#### Scenario: Button labels
- **WHEN** a screen reader encounters a button
- **THEN** it reads the button's aria-label (e.g., "Ouvir letra A", "Falar palavra CASA", "Próxima lição")

#### Scenario: Image descriptions
- **WHEN** a screen reader encounters an emoji or image
- **THEN** it reads the alt text or aria-label describing the image content

#### Scenario: Live regions
- **WHEN** lesson instructions or feedback messages change dynamically
- **THEN** screen readers announce the change via aria-live="polite"

### Requirement: Color contrast
The UI SHALL meet WCAG 2.1 AA contrast ratios.

#### Scenario: Text contrast
- **WHEN** text is displayed on any background
- **THEN** contrast ratio is at least 4.5:1 for normal text and 3:1 for large text (18px+)

#### Scenario: Non-text contrast
- **WHEN** UI components (buttons, input borders) convey information via color
- **THEN** contrast ratio against adjacent colors is at least 3:1

### Requirement: Screen reader announcements
Game feedback and lesson instructions SHALL be announced by screen readers.

#### Scenario: Correct answer feedback
- **WHEN** user types a correct letter/syllable/word
- **THEN** screen reader announces "Correto!" via an aria-live region

#### Scenario: Error feedback
- **WHEN** user types an incorrect key
- **THEN** screen reader announces "Tente novamente" and the expected target

#### Scenario: Points and achievements
- **WHEN** user earns points or unlocks an achievement
- **THEN** screen reader announces the points/achievement description

### Requirement: Accessibility audit
The frontend SHALL include automated accessibility checks.

#### Scenario: axe-core integration
- **WHEN** components are rendered in test environment or development mode
- **THEN** axe-core scans for WCAG 2.1 AA violations and logs them to console

#### Scenario: No critical violations
- **WHEN** a full page audit runs
- **THEN** there are no critical or serious accessibility violations detected

### Requirement: Accessible virtual keyboard
The virtual keyboard SHALL be fully accessible to screen readers and keyboard users.

#### Scenario: Key labels
- **WHEN** a screen reader navigates the virtual keyboard
- **THEN** each key announces its letter name and status (e.g., "Tecla A, não pressionada", "Tecla A, correta")

#### Scenario: Keyboard interaction
- **WHEN** user clicks a virtual key with mouse or activates it via keyboard
- **THEN** the key press is processed identically to the physical key press

