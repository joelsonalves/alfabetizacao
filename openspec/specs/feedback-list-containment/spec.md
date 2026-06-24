# feedback-list-containment Specification

## Purpose
TBD - created by archiving change contain-feedback-list-height. Update Purpose after archive.
## Requirements
### Requirement: Maximum container height

The feedback list SHALL have a fixed maximum height of 140px.

#### Scenario: List exceeds max height

- **WHEN** the number of feedback items causes the list to exceed 140px in height
- **THEN** the list SHALL display a vertical scrollbar
- **AND** the VirtualKeyboard and other elements below the list SHALL remain in their original positions

#### Scenario: List fits within max height

- **WHEN** the number of feedback items fits within 140px
- **THEN** the list SHALL display without a scrollbar
- **AND** the list height SHALL be determined by its content (auto)

### Requirement: Scrollable overflow

The feedback list SHALL scroll vertically when content exceeds the maximum height.

#### Scenario: Scroll interaction

- **WHEN** the user scrolls within the feedback list
- **THEN** the items above/below SHALL become visible
- **AND** the VirtualKeyboard SHALL remain fixed and not scroll with the list

#### Scenario: Scrollbar appearance

- **WHEN** the feedback list content exceeds 140px
- **THEN** the scrollbar SHALL be visible with `scrollbar-width: thin`

### Requirement: Item count limit

The feedback list SHALL store a maximum of 5 most recent items in state.

#### Scenario: New feedback added when at limit

- **WHEN** a new feedback is added and there are already 5 items
- **THEN** the oldest item SHALL be removed
- **AND** the new item SHALL be appended

