## ADDED Requirements

### Requirement: Lesson type "blending" exists in seed data

The system SHALL seed a new module "Montagem Silábica" with `module_type: "blending"` between the existing "Sílabas Complexas" module and "Palavras" module.

Each lesson in this module SHALL have:
- `lesson_type`: `"blending"`
- `target`: the complete word (e.g., `"PATO"`)
- `content`: a JSON string with `{"syllables": ["PA", "TO"], "word": "PATO"}`

The seed SHALL include at least 10 words with 2 to 4 syllables, prioritizing regular spelling.

#### Scenario: Seed creates blending module
- **WHEN** the seed script runs `python seed.py`
- **THEN** a module with `module_type == "blending"` is created
- **AND** it contains lessons with `lesson_type == "blending"`
- **AND** each lesson has `content` parseable as JSON with keys `syllables` and `word`

#### Scenario: Blending module position
- **WHEN** modules are ordered by `sort_order`
- **THEN** the `blending` module appears after "Sílabas Complexas" and before "Palavras"

### Requirement: SyllableBlending component renders step-by-step

A `<SyllableBlending>` component SHALL be created at `src/components/SyllableBlending/SyllableBlending.jsx`.

The component SHALL receive props:
- `lesson`: lesson object with `content` (parsed JSON) containing `syllables` (string[]) and `word` (string)
- `onComplete`: callback invoked when the final word step is completed

The component SHALL progress through `syllables.length + 1` steps:
1. Steps `0` to `n-1`: each syllable from `syllables[]`
2. Step `n`: the complete `word`

Each step SHALL display the target text (syllable or word) and await both speech and keyboard input before advancing.

#### Scenario: Component renders initial syllable
- **WHEN** `lesson` has `content.syllables = ["PA", "TO"]` and `content.word = "PATO"`
- **THEN** the component SHALL display "PA" as the first target
- **AND** show progress indicator "1/3"

#### Scenario: Component advances through all steps
- **WHEN** the user completes the current step (speaks AND types correctly)
- **THEN** the component SHALL advance to the next step automatically
- **AND** show updated progress (e.g., "2/3")

#### Scenario: Component calls onComplete after final step
- **WHEN** the user completes the last step (the full word)
- **THEN** the component SHALL call `onComplete` with no arguments

### Requirement: Speech recognition works per-step

The component SHALL start speech recognition for each step when that step becomes current.

The component SHALL use `useSpeechRecognition` hook's `startListening` with a timeout:
- `timeoutMs`: `4_000` for syllables, `10_000` for the final word (configurable)

When speech matches the current target (after `normalizeText`), the step SHALL mark speech as complete.

When the user clicks the speech button and `stopListening` is called (manual stop), speech SHALL be considered complete for that step.

#### Scenario: Speech match on syllable
- **WHEN** the current step is "PA" and the user says "PA"
- **THEN** `onResult` matches via `normalizeText`
- **AND** the step marks speech as complete
- **AND** advances to next step if keyboard is also complete

#### Scenario: Manual stop completes speech
- **WHEN** the user clicks "Terminei de ler" (triggering `stopListening`)
- **THEN** the step marks speech as complete
- **AND** advances to next step if keyboard is also complete

### Requirement: Keyboard input works per-step

The component SHALL use `useKeyboard` to capture keyboard input for the current target.

The `useKeyboard` hook SHALL receive the current step's target as its target prop.

When the typed input matches the target exactly (case-insensitive), the step SHALL mark keyboard as complete.

After completing a step, the keyboard SHALL reset for the next target.

#### Scenario: Typing matches syllable target
- **WHEN** the current step is "PA"
- **AND** the user types "P" then "A"
- **THEN** `useKeyboard` signals match
- **AND** the step marks keyboard as complete

#### Scenario: Both speech and keyboard needed
- **WHEN** speech is complete but keyboard is not
- **THEN** the component SHALL NOT advance
- **AND** SHALL show visual cue that keyboard input is still needed

### Requirement: Visual design follows existing patterns

The SyllableBlending component SHALL follow the same visual conventions as the existing lesson UI:

- Speech button with toggle "🎤 Ler em voz alta" / "🛑 Terminei de ler"
- Speech button with `min-width: 200px`
- Badge `[1]` on speech button, badge `[2]` on keyboard area (or vice versa matching existing convention)
- Progress indicator showing current step out of total (e.g., "Sílaba 1 de 2", "Palavra")
- Border and hover effects consistent with lesson buttons

#### Scenario: Speech button shows correct state
- **WHEN** step is "PA"
- **THEN** the speech button SHALL show "🎤 Ler em voz alta [1]"
- **AND** have class `.btn-outline` with `.speech-badge`

#### Scenario: Completed step is visually marked
- **WHEN** a step is completed (speech + keyboard)
- **THEN** the completed step SHALL show "✅ PA" in the progress area
- **AND** the next step SHALL become active

### Requirement: Lesson.jsx renders SyllableBlending for blending type

The `Lesson.jsx` file SHALL detect `lesson_type === "blending"` and render the `<SyllableBlending>` component instead of the existing letter/syllable/word rendering paths.

Constants in `Lesson.jsx` SHALL include:
- `LESSON_TYPE_REQUIRES_SPEECH`: include `"blending"` in the set
- `SPEECH_TYPE_NAMES`: include `"blending"`
- `POINTS`: include `60` points for `"blending"` lesson type
- `SPEECH_TIMEOUTS`: include `20_000` timeout for `"blending"` type (component manages per-step timeouts internally)

#### Scenario: Lesson renders SyllableBlending component
- **WHEN** `lesson.lesson_type === "blending"`
- **THEN** Lesson.jsx SHALL render `<SyllableBlending>` instead of the default word/letter rendering
- **AND** pass `lesson` and `onComplete` props

#### Scenario: Points mapped correctly
- **WHEN** `lesson.lesson_type === "blending"`
- **THEN** `POINTS["blending"]` SHALL equal `60`

### Requirement: Progress tracking uses existing API

When `onComplete` is called, `Lesson.jsx` SHALL handle progress saving via the existing `progressMutation`, same as other lesson types.

The `checklistItems` array in Lesson.jsx SHALL be dynamically generated for blending lessons based on `content.syllables`:

```js
// Example for "PATO" with syllables ["PA", "TO"]
checklistItems = [
  { id: "syllable-1", label: "Ler Sílaba 1 (PA)", done: false },
  { id: "syllable-2", label: "Ler Sílaba 2 (TO)", done: false },
  { id: "word", label: "Ler Palavra (PATO)", done: false },
]
```

#### Scenario: Checklist reflects blending steps
- **WHEN** `lesson.lesson_type === "blending"` and `content.syllables = ["PA", "TO"]`
- **THEN** `checklistItems` SHALL contain 3 items: syllable 1, syllable 2, and word
- **AND** items SHALL update their `done` status as steps complete

### Requirement: SyllableBlending CSS file exists

A CSS file SHALL be created at `src/components/SyllableBlending/SyllableBlending.css`.

It SHALL define styles for:
- `.syllable-blending`: container
- `.syllable-blending__progress`: progress bar / step indicator
- `.syllable-blending__target`: large text display for current syllable/word
- `.syllable-blending__step-done`: completed step indicator
- `.syllable-blending__actions`: speech button + keyboard area
- `.syllable-blending__completed`: celebration/finished state

#### Scenario: CSS classes are applied
- **WHEN** SyllableBlending renders
- **THEN** the container SHALL have class `syllable-blending`
- **AND** the target text SHALL have class `syllable-blending__target`
