## Why

Quando uma sílaba não tem entrada em `SYLLABLE_EMOJI_MAP` (ex: "WA", "WE", "WI", "WO", "WU"), `get_emoji_for_syllable()` fazia fallback para `get_emoji_for_letter(key[0])`, exibindo o emoji associado à primeira letra da sílaba. Isso gera **falsos positivos**: uma sílaba sem emoji próprio mostra uma imagem que não corresponde foneticamente à sílaba.

O espec `fix-syllable-me-emoji` já define que o comportamento correto é retornar `None` (sem imagem) para sílabas sem entrada — o código atual é uma regressão.

## What Changes

1. **`backend/app/services/images.py`**: Remover o fallback `return get_emoji_for_letter(key[0])` em `get_emoji_for_syllable()`, substituindo por `return None`.
2. **Força backfill**: Executar `backfill_lesson_images_force()` para limpar `image_url` de sílabas sem entrada no mapa (WA, WE, WI, WO, WU).

## Capabilities

### Modified Capabilities
- `fix-syllable-me-emoji`: O requisito de fallback é removido — sílabas sem entrada em `SYLLABLE_EMOJI_MAP` DEVEM retornar `None` em vez de cair no emoji da letra inicial.

## Impact

- **`backend/app/services/images.py`**: Linha 730, `return get_emoji_for_letter(key[0])` → `return None`.
- **Banco de dados**: Lições de sílabas sem entrada no mapa (WA, WE, WI, WO, WU) terão `image_url` limpo após force backfill.
- **Frontend**: Essas lições deixam de mostrar emoji (fallback para `image_active`/placeholder).
