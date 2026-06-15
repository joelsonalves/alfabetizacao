## Why

When a user speaks a full sentence in a sentence-type lesson, the system extracts a single short word (e.g., "A" or "TEM") as the "spoken content" instead of showing what the user actually said. This makes feedback confusing and unhelpful. The root cause is a flawed fallback in `extractSpokenContent()` that picks the shortest word from the transcript when the match fails, combined with an overly strict matching algorithm for multi-word targets.

## What Changes

- Replace the **shortest-word fallback** in `extractSpokenContent()` with a smarter strategy: show the full user transcript (or a meaningful portion of it) when the match fails.
- Improve **sentence-level matching** in `tryExtractTarget()` to support partial/overlap matching (e.g., word-level containment or edit distance), so similar sentences are recognized as correct.
- Add **dedicated sentence-matching logic** that checks if the user's utterance contains all target words in the correct relative order (with tolerance for extra/missing words).
- Update feedback display to show the actual transcript (not just the shortest word) in the "Você disse:" line.
- Add tests for sentence-level speech matching.

## Capabilities

### New Capabilities
- `lesson-speech-matching`: Covers the speech recognition matching and content extraction logic for sentence-type lessons, including partial matching, word-overlap scoring, and meaningful feedback display.

### Modified Capabilities
- *(none — no existing specs are changing)*

## Impact

- **Frontend**: `frontend/src/pages/Lesson.jsx` — `extractSpokenContent()`, `tryExtractTarget()`, and `handleSpeech()` feedback logic.
- **Frontend tests**: `frontend/src/tests/Lesson.test.jsx` — new test cases for sentence-level matching and content extraction.
