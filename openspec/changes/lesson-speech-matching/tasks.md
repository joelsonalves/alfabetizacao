## 1. Refactor `extractSpokenContent` — Full transcript fallback

- [ ] 1.1 Replace `words.reduce((a, b) => a.length <= b.length ? a : b)` with the full normalized `transcript` string
- [ ] 1.2 Verify that on match, `content` still returns the `target` (unchanged)
- [ ] 1.3 Verify that on empty transcript, `content` returns empty string (edge case preserved)

## 2. Add subsequence matching for sentence/phrase lessons

- [ ] 2.1 Implement a helper function `isSubsequence(targetWords, transcriptWords)` that returns `true` if all `targetWords` appear in `transcriptWords` in order (allowing extra words between them)
- [ ] 2.2 Integrate `isSubsequence` check into `tryExtractTarget()`, gated by `lesson_type === 'sentence' || lesson_type === 'phrase'`
- [ ] 2.3 Ensure the subsequence check runs AFTER all existing checks (exact match, prefix strip, word inclusion) — it should be an additional acceptance path, not a replacement

## 3. Wire `lesson_type` into `extractSpokenContent`

- [ ] 3.1 Pass `lesson_type` as a parameter to `extractSpokenContent()` so it can gate the subsequence logic
- [ ] 3.2 Update the call site in `handleSpeech()` to pass `currentLesson.lesson_type`

## 4. Update tests

- [ ] 4.1 Add test: sentence matches via subsequence when one target word is missing
- [ ] 4.2 Add test: sentence matches via subsequence when extra words are present
- [ ] 4.3 Add test: sentence fails subsequence when words are out of order
- [ ] 4.4 Add test: sentence fallback shows full transcript (not shortest word)
- [ ] 4.5 Add test: letter lesson exact match still works (regression)
- [ ] 4.6 Add test: syllable lesson exact match still works (regression)
- [ ] 4.7 Add test: word lesson exact match still works (regression)
- [ ] 4.8 Add test: empty transcript returns empty content

## 5. Manual verification

- [ ] 5.1 Test on `/lesson/7/247` speaking a slightly different sentence — verify feedback shows full transcript and matching is more lenient
- [ ] 5.2 Test on a letter lesson — verify exact match behavior is unchanged
- [ ] 5.3 Test on a word lesson — verify exact match behavior is unchanged
- [ ] 5.4 Run full test suite: `cd frontend && npx vitest run`
