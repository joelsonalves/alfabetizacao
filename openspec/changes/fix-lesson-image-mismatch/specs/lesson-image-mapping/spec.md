## ADDED Requirements

### Requirement: Accurate image-text mapping for lessons
The system SHALL ensure that the image displayed for a lesson matches the text description (target) of the lesson.

#### Scenario: Verify Pássaro mapping
- **WHEN** user is on lesson with target containing "PÁSSARO"
- **THEN** system SHALL return the 🐦 emoji (bird) instead of falling back to letter "P"
- **AND** system SHALL NOT display 🐧 (penguin) for any lesson referencing "pássaro"

#### Scenario: Prevent false syllable fallback for possessive pronouns
- **WHEN** user is on lesson with target containing "MEU", "MINHA", "SEU", "SUA", "NOSSO"
- **THEN** system SHALL skip these words and search for the next semantically relevant word
- **AND** system SHALL NOT display 🪑 (chair) for any such lesson

### Requirement: Systematic audit of lesson assets
The system SHALL maintain consistent mapping between lesson `target` and `image_url` for all lessons.

#### Scenario: Audit image consistency
- **WHEN** an admin audits lesson assets
- **THEN** the system SHALL provide a way to verify that `image_url` aligns with `target` description

## MODIFIED Requirements

### Requirement: Stop words in get_emoji_for_text
**Current**: The function `get_emoji_for_text` in `backend/app/services/images.py` only skips articles and prepositions: `("o", "a", "os", "as", "um", "uma", "de", "da", "do", "em", "no", "na")`.

**Reason**: Words starting with "ME", "SE", "NO", "TE" trigger false positives in syllable fallback, producing confusing emojis like chair, seal, etc. These words are semantically poor and should not influence the emoji selection.

**Migration**: Expand the stop words list to include:
- Possessive pronouns: `meu`, `minha`, `meus`, `minhas`, `teu`, `tua`, `teus`, `tuas`, `seu`, `sua`, `seus`, `suas`, `nosso`, `nossa`, `nossos`, `nossas`
- Common verbs: `é`, `são`, `tem`, `têm`
- Other common words: `com`, `para`, `por`

### Requirement: Mapping of P to image
**Current**: P is mapped to '🐧' (Penguin/Pinguim) in `EMOJI_MAP`.

**Reason**: The word "pássaro" was not in `WORD_EMOJI_MAP`, causing the system to fall back to the letter "P" which maps to "pinguim".

**Migration**: Added "pássaro" to `WORD_EMOJI_MAP` with value `🐦`.

### Requirement: Mapping of X to image
**Current**: X is mapped to '❌' (Cross Mark) in `EMOJI_MAP`.

**Reason**: O emoji ❌ (X vermelho) é semanticamente inadequado para alfabetização infantil, pois associa a letra X a "errado" ou "proibido". Crianças podem confundir o símbolo visual com o conceito de incorreção, prejudicando a associação positiva com a letra.

**Migration**: Alterar o mapeamento de X em `EMOJI_MAP` de `❌` para `☕` (xícara), que é uma palavra comum no universo infantil brasileiro e aparece frequentemente em materiais didáticos de alfabetização.

**Observação**: Esta alteração entra em conflito com a associação fonética ideal (X de XÍCARA soa como "XI", não "X"), mas é a melhor opção disponível no conjunto de emojis Unicode para representar uma palavra cotidiana reconhecível por crianças.
