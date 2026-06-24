## Context

O módulo `backend/app/services/images.py` contém a função `get_emoji_for_syllable()` que resolve o emoji associado a uma sílaba. O spec `fix-syllable-me-emoji` especifica que sílabas sem entrada em `SYLLABLE_EMOJI_MAP` devem retornar `None`. No entanto, o código atual contém um fallback para `get_emoji_for_letter(key[0])`, que retorna o emoji da primeira letra da sílaba — um falso positivo.

Além disso, o banco de dados possui lições (como WA, WE, WI, WO, WU) que foram populadas com `image_url` baseado nesse fallback. Após a correção, é necessário forçar um backfill para limpar esses URLs obsoletos.

## Goals / Non-Goals

**Goals:**
- Remover o fallback `get_emoji_for_letter(key[0])` em `get_emoji_for_syllable()`
- Sincronizar o código com o comportamento já especificado em `fix-syllable-me-emoji`
- Limpar `image_url` de lições afetadas (WA, WE, WI, WO, WU) via force backfill

**Non-Goals:**
- Não altera o `EMOJI_MAP` ou `SYLLABLE_EMOJI_MAP` — apenas o comportamento de fallback
- Não adiciona novas sílabas ao mapa
- Não altera o frontend

## Decisions

### Decisão 1: `return None` em vez de `get_emoji_for_letter(key[0])`

**Alternativas consideradas:**
- **Manter fallback**: A sílaba "WA" mostraria o emoji da letra "W" (🌐 globo). Foneticamente incorreto — "WA" não é "W".
- **Remover completamente**: Nenhuma imagem é mostrada para sílabas sem entrada. O frontend já lida com `image_url: null` exibindo um placeholder ou `image_active`.

**Decisão:** Remover o fallback. O comportamento pedagógico correto é não mostrar imagem quando não há correspondência exata, evitando confusão fonética.

### Decisão 2: Force backfill preserva edições manuais

A função `backfill_lesson_images_force()` já contém lógica para verificar `if lesson.image_url != resolved_url` antes de atualizar. Isso garante que edições manuais feitas pelo admin (que modificam `image_url` para um valor customizado) não são sobrescritas.

## Risks / Trade-offs

- **Risco**: Lições sem imagem podem parecer "quebradas" para o usuário. **Mitigação**: O frontend já trata `image_url: null` com fallback para `image_active` ou placeholder.
- **Risco**: Outras sílabas podem estar no banco com `image_url` desatualizado (ex: "GLO" mostra globo 🌐 mas o fallback da letra "G" daria 🤚). **Mitigação**: O force backfill já corrigiu 16 lições na execução inicial.
