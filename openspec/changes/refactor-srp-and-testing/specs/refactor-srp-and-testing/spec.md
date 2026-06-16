## ADDED Requirements

### Requirement: `normalize()` extraída para utils

A função `normalize(s)` duplicada em `Lesson.jsx` e `SyllableBlending.jsx` SHALL ser
extraída para `src/utils/string.js` com uma única implementação.

#### Scenario: Normalize strips diacritics and uppercase
- **GIVEN** `normalize("café")`
- **THEN** SHALL return `"CAFE"`

#### Scenario: Normalize removes non-alpha chars
- **GIVEN** `normalize("Olá! Como vai?")`
- **THEN** SHALL return `"OLA COMO VAI"`

#### Scenario: Normalize trims whitespace
- **GIVEN** `normalize("  casa  ")`
- **THEN** SHALL return `"CASA"`

### Requirement: `isSubsequence()` extraída para utils

A função em `Lesson.jsx` SHALL ser extraída para `src/utils/array.js`.

#### Scenario: Target is subsequence of transcript
- **GIVEN** targetWords=["O","GATO","BEBE"], transcriptWords=["O","GATO","PRETO","BEBE"]
- **THEN** SHALL return `true`

#### Scenario: Target is NOT a subsequence
- **GIVEN** targetWords=["O","GATO","BEBE"], transcriptWords=["GATO","O","BEBE"]
- **THEN** SHALL return `false` (out of order)

#### Scenario: Empty target
- **GIVEN** targetWords=[], transcriptWords=["qualquer"]
- **THEN** SHALL return `true`

### Requirement: `tryExtractTarget()` extraída para utils

Extraída para `src/utils/speech.js`.

#### Scenario: Exact match
- **GIVEN** transcript="CASA", target="CASA"
- **THEN** SHALL return `true`

#### Scenario: Match with prefix
- **GIVEN** transcript="PALAVRA CASA", target="CASA"
- **THEN** SHALL return `true`

#### Scenario: No match
- **GIVEN** transcript="BOLA", target="CASA"
- **THEN** SHALL return `false`

### Requirement: `calculate_level()` extraída para services

Extraída para `app/services/progress.py`.

#### Scenario: Below next level
- **GIVEN** xp=400, current_level=1 (threshold=500)
- **THEN** `calculate_level(400, 1)` SHALL return `1`

#### Scenario: Exactly at threshold
- **GIVEN** xp=500, current_level=1
- **THEN** `calculate_level(500, 1)` SHALL return `2`

#### Scenario: Multiple levels at once
- **GIVEN** xp=2500, current_level=1
- **THEN** `calculate_level(2500, 1)` SHALL return `3` (1→2 at 500, 2→3 at 1000 = 1500 cumulative? Let's compute correctly)

### Requirement: Geradores de seed extraídos

Extraídos para `app/services/seed.py`.

#### Scenario: generate_simple_syllables returns CV pairs
- **WHEN** `generate_simple_syllables()` é chamada
- **THEN** SHALL retornar uma lista com 105 itens (21 consoantes × 5 vogais)
- **AND** cada item SHALL ter as chaves `name`, `lesson_type="syllable"`, `target`, `sort_order`

#### Scenario: generate_blending_words has content with syllables
- **WHEN** `generate_blending_words()` é chamada
- **THEN** cada item SHALL ter `content` com `syllables` e `word`

### Requirement: Funções de auth storage extraídas

Extraídas para `src/utils/auth.js`.

#### Scenario: storeAuthData saves to localStorage
- **GIVEN** `storeAuthData({ access_token: "abc", refresh_token: "def", user: { name: "Joel" } })`
- **THEN** localStorage SHALL ter `token="abc"`, `refresh_token="def"`, `user='{"name":"Joel"}'`

#### Scenario: getStoredTokens retrieves saved tokens
- **GIVEN** localStorage has `token` and `refresh_token`
- **WHEN** `getStoredTokens()` é chamada
- **THEN** SHALL retornar `{ token: "abc", refreshToken: "def" }`
