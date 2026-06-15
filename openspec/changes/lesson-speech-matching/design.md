## Context

The lesson page supports speech recognition for letter, syllable, word, phrase, and sentence types. The current matching pipeline:

1. `normalize()` strips diacritics, punctuation, and uppercases
2. `tryExtractTarget()` checks exact match, space-stripped match, prefix-stripped match, word inclusion, and ends-with
3. `extractSpokenContent()` returns the target on match, or the **shortest word** from the transcript on failure

**The bug**: For sentence lessons (e.g., target = "A CASA TEM UMA PORTA VERMELHA"), if the user says "A CASA TEM PORTA VERMELHA E AS JANELAS SÃO AZUIS":
- `tryExtractTarget()` fails (word "UMA" is missing, extra content at end)
- `extractSpokenContent()` picks `words.reduce((a, b) => a.length <= b.length ? a : b)` → returns `"A"`
- Feedback shows `❌ Você disse: A (esperado: A CASA TEM PORTA VERMELHA...)` — misleading

## Goals / Non-Goals

**Goals:**
- Show the actual user utterance (full transcript or meaningful portion) in feedback, never just a single word from it
- Add sentence-level matching that accepts similar utterances (e.g., missing/extra words, word order preserved)
- Keep existing exact-match path for letter/syllable/word lessons unchanged
- All existing tests continue to pass

**Non-Goals:**
- Change the TTS output or feedback structure (only the "Você disse:" content)
- Replace the ASR engine or modify `useSpeechRecognition.js`
- Add scoring/confidence metrics from the Web Speech API
- Change the backend or API

## Decisions

### Decision 1: Show the full transcript when match fails, not shortest word
- **Choice**: Replace `words.reduce((a, b) => a.length <= b.length ? a : b)` with the full normalized transcript.
- **Rationale**: The user said a full sentence; the feedback should show what they actually said. A single word is confusing and uninformative.
- **Alternatives considered**:
  - Show longest common subsequence — over-engineered for this case; full transcript is simpler and more honest.
  - Show first N words — arbitrary truncation; full transcript is better.

### Decision 2: Add word-overlap matching for sentence targets
- **Choice**: Add a new matching check in `tryExtractTarget()` for multi-word targets: split both normalized transcript and target into words, and check if the target words appear as a subsequence in the transcript words (in order, but allowing extra words in between).
- **Rationale**: For sentence lessons, users naturally vary wording (e.g., omit "UMA", add extra descriptors). A subsequence match captures the core intent while tolerating variation.
- **Alternatives considered**:
  - Levenshtein edit distance on the normalized string — could work but subsequence word matching is more aligned with the semantics of "did they say the key words in order?"
  - Jaccard similarity on word sets — loses word order, could match very different sentences.
  - Exact match only (current behavior) — too strict for sentences; forces perfect recall.

### Decision 3: Keep existing matching logic for non-sentence types unchanged
- **Choice**: The new subsequence matching only applies when `lesson_type` is `'sentence'` or `'phrase'`. Letter/syllable/word lessons keep the current exact-match logic.
- **Rationale**: For short targets (letters, syllables, words), exact match is appropriate and changing it could introduce regressions.
- **Alternatives considered**: Apply subsequence matching to all types — rejected because it's too lenient for letter lessons (e.g., "A" could match any sentence containing "A").

### Decision 4: Extract the score/attempt data reliably
- **Choice**: Store the full transcript (via `content`) so the history shows what the user actually said.
- **Rationale**: The current `content` stores either `target` (on correct) or the shortest word (on incorrect). This loses information. Using the full transcript preserves the record of what the user said for both success and failure.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Subsequence matching could accept incorrect but word-overlapping utterances | Set a minimum overlap threshold (e.g., require at least 80% of target words present) or require the first and last word to match. |
| Full transcript in feedback could be very long for long utterances | Truncate to a reasonable max length (e.g., 200 chars) with "..." suffix. |
| Changing `content` affects TTS output (which speaks `content`) | TTS should use a shorter message for long content. Use `displayTarget` in TTS messages (as planned in `corrigir-feedback-fala`). |
| Subsequence matching may be slower for very long transcripts | Transcripts are typically short (< 50 words); performance impact is negligible. |
