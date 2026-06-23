## Why

Duas divergências entre texto e imagem foram reportadas:
1. Lição `/lesson/6/240`: cita um "pássaro", mas exibe pinguim.
2. Lição `/lesson/7/248`: exibe uma cadeira sem relação com o contexto da frase.

Ambas têm a mesma causa raiz: a função `get_emoji_for_text` em `backend/app/services/images.py` possui uma lógica de *fallback* que mapeia incorretamente palavras para emojis, seja pela primeira letra (P → pinguim) ou pelas duas primeiras letras (ME → cadeira).

## What Changes

- Correção imediata: adicionar "pássaro" ao `WORD_EMOJI_MAP` (lição 240).
- Correção sistêmica: expandir a lista de *stop words* em `get_emoji_for_text` para incluir pronomes possessivos, verbos de ligação e outras palavras comuns que geram falsos positivos.
- Atualizar também `backend/app/services/seed.py` para manter consistência.

## Capabilities

### New Capabilities
- `lesson-image-mapping`: Correção e auditoria da associação entre texto e imagem nas lições.

### Modified Capabilities
- Nenhuma.

## Impact

- **`backend/app/services/images.py`**: Expansão da lista de *stop words* na função `get_emoji_for_text`.
- **`backend/app/services/seed.py`**: Mesma correção de *stop words* para manter consistência.
