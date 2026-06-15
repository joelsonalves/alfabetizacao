## ADDED Requirements

### Requirement: Full transcript shown on failed match
When `tryExtractTarget()` returns false for any lesson type, the `content` returned by `extractSpokenContent()` SHALL be the full normalized user transcript, not a single extracted word.

#### Scenario: Sentence transcript shown in full on mismatch
- **WHEN** the user speaks "A CASA TEM PORTA VERMELHA E AS JANELAS SÃO AZUIS"
- **AND** the target is "A CASA TEM UMA PORTA VERMELHA"
- **AND** `tryExtractTarget()` returns false
- **THEN** `extractSpokenContent()` SHALL return `content` = "A CASA TEM PORTA VERMELHA E AS JANELAS SAO AZUIS" (the full normalized transcript)

#### Scenario: Short transcript shown in full on mismatch
- **WHEN** the user speaks "BANANA"
- **AND** the target is "CASA"
- **AND** `tryExtractTarget()` returns false
- **THEN** `extractSpokenContent()` SHALL return `content` = "BANANA" (the full transcript)

### Requirement: Sentence-level matching uses word subsequence
For lessons with `lesson_type` of `'sentence'` or `'phrase'`, `tryExtractTarget()` SHALL additionally check if the target words appear as a subsequence in the transcript words (in order, allowing extra words between them).

#### Scenario: Sentence matches with missing word
- **WHEN** the user speaks "A CASA TEM PORTA VERMELHA E AS JANELAS SAO AZUIS"
- **AND** the target is "A CASA TEM UMA PORTA VERMELHA E AS JANELAS SAO AZUIS"
- **AND** the lesson_type is "sentence"
- **THEN** `tryExtractTarget()` SHALL return true
- **BECAUSE** "A CASA TEM PORTA VERMELHA E AS JANELAS SAO AZUIS" contains all target words except "UMA" in order

#### Scenario: Sentence matches with extra words
- **WHEN** the user speaks "HOJE A CASA MUITO GRANDE TEM UMA PORTA VERMELHA AMARELA"
- **AND** the target is "A CASA TEM UMA PORTA VERMELHA"
- **AND** the lesson_type is "sentence"
- **THEN** `tryExtractTarget()` SHALL return true
- **BECAUSE** "A", "CASA", "TEM", "UMA", "PORTA", "VERMELHA" appear in order in the transcript

#### Scenario: Sentence does not match when words are out of order
- **WHEN** the user speaks "VERMELHA PORTA UMA TEM CASA A"
- **AND** the target is "A CASA TEM UMA PORTA VERMELHA"
- **AND** the lesson_type is "sentence"
- **THEN** `tryExtractTarget()` SHALL return false
- **BECAUSE** the target words do not appear as a subsequence (reversed order)

### Requirement: Short exact-match targets keep existing behavior
For lessons with `lesson_type` of `'letter'`, `'consonant'`, `'syllable'`, or `'word'`, the matching logic SHALL remain unchanged (exact match, prefix stripping, word inclusion).

#### Scenario: Letter lesson exact match unchanged
- **WHEN** the user speaks "LETRA B"
- **AND** the target is "B"
- **AND** the lesson_type is "letter"
- **THEN** `tryExtractTarget()` SHALL return true via prefix stripping (unchanged)

#### Scenario: Word lesson exact match unchanged
- **WHEN** the user speaks "CASA"
- **AND** the target is "CASA"
- **AND** the lesson_type is "word"
- **THEN** `tryExtractTarget()` SHALL return true via exact match (unchanged)

### Requirement: Feedback shows actual user utterance
The feedback display `"Você disse: <content>"` SHALL use the `content` returned by `extractSpokenContent()`, which (after this change) shows the full user transcript on mismatch.

#### Scenario: Incorrect sentence shows full utterance
- **WHEN** the user speaks "MEU CACHORRO É BONITO"
- **AND** the target is "A CASA É GRANDE"
- **AND** `tryExtractTarget()` returns false
- **THEN** the feedback SHALL display `❌ Você disse: MEU CACHORRO É BONITO (esperado: A CASA É GRANDE)`
- **AND** the suggestion SHALL display `💡 Tente falar só a FRASE: A CASA É GRANDE`

#### Scenario: Incorrect single word shows full utterance
- **WHEN** the user speaks "BANANA"
- **AND** the target is "CASA"
- **AND** `tryExtractTarget()` returns false
- **THEN** the feedback SHALL display `❌ Você disse: BANANA (esperado: CASA)`

### Requirement: Automated tests cover sentence matching
The system SHALL include automated tests for the sentence-level subsequence matching and full-transcript fallback.

#### Scenario: Test subsequence matching with missing word
- **WHEN** `extractSpokenContent("A CASA TEM PORTA VERMELHA", "A CASA TEM UMA PORTA VERMELHA", ["A CASA TEM UMA PORTA VERMELHA"])` is called
- **AND** lesson_type is "sentence"
- **THEN** `isCorrect` SHALL be `true`
- **AND** `content` SHALL be `"A CASA TEM UMA PORTA VERMELHA"` (the target, since match succeeded)

#### Scenario: Test subsequence matching with extra words
- **WHEN** `extractSpokenContent("HOJE A CASA GRANDE TEM UMA PORTA VERMELHA", "A CASA TEM UMA PORTA VERMELHA", ["A CASA TEM UMA PORTA VERMELHA"])` is called
- **AND** lesson_type is "sentence"
- **THEN** `isCorrect` SHALL be `true`

#### Scenario: Test subsequence fails on wrong order
- **WHEN** `extractSpokenContent("VERMELHA PORTA UMA TEM CASA A", "A CASA TEM UMA PORTA VERMELHA", ["A CASA TEM UMA PORTA VERMELHA"])` is called
- **AND** lesson_type is "sentence"
- **THEN** `isCorrect` SHALL be `false`
- **AND** `content` SHALL be `"VERMELHA PORTA UMA TEM CASA A"` (full transcript)

#### Scenario: Test letter lesson unchanged
- **WHEN** `extractSpokenContent("LETRA B", "B", ["B", "BE"])` is called
- **AND** lesson_type is "letter"
- **THEN** `isCorrect` SHALL be `true` (unchanged prefix-stripping behavior)
- **AND** `content` SHALL be `"B"` (the target)

#### Scenario: Test sentence fallback shows full transcript
- **WHEN** `extractSpokenContent("BANANA", "A CASA TEM UMA PORTA VERMELHA", ["A CASA TEM UMA PORTA VERMELHA"])` is called
- **AND** `tryExtractTarget()` returns false
- **THEN** `content` SHALL be `"BANANA"` (full transcript), not `"A"` (shortest word)

#### Scenario: Test empty transcript
- **WHEN** `extractSpokenContent("", "A CASA", ["A CASA"])` is called
- **AND** `tryExtractTarget()` returns false
- **THEN** `content` SHALL be `""` (empty string, unchanged from current behavior)
