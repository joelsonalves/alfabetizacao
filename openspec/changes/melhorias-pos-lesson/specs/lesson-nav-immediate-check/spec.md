# Lesson Nav Immediate Check

## ADDED Requirements

### Requirement: Nav menu marks lesson as completed when three actions are done

The system SHALL mark the current lesson item in the lesson navigation menu (`.lesson-nav`) as completed (✅) immediately when the user completes all three required actions (Ouvir, Falar, Teclar), without waiting for the "Próxima Lição" button click.

#### Scenario: Nav checkmark appears on canComplete

- **WHEN** the user has listened (`hasListened`), spoken correctly (`hasSpoken`), and typed the full target (`kb.completed`)
- **THEN** the current lesson's nav item SHALL display ✅ immediately, before the result screen appears

#### Scenario: Nav checkmark persists after navigating away

- **WHEN** a lesson is marked as completed via `canComplete`
- **THEN** the ✅ SHALL remain visible even if the user navigates to another lesson and back

#### Scenario: Nav checkmark does not appear before all three actions

- **WHEN** the user has only completed some actions (e.g., only Ouvir and Falar, but not Teclar)
- **THEN** the lesson nav item SHALL NOT show ✅
