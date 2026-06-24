## Context

O sistema atualmente gerencia exibição de imagens via:
- `Lesson.image_url` — o emoji/URL armazenado
- `Lesson.image_active` — boolean que o frontend usa para decidir se exibe ou não
- Live-resolution no frontend — quando `image_url` é null, o frontend chama as APIs `/images/*` para resolver

O problema é que não há um vínculo semântico entre a intenção do admin e o comportamento do sistema. Um admin que quer remover a imagem de uma lição não tem como expressar "esta lição não deve ter imagem, ponto final" — mesmo marcando `image_active=false`, o backfill e o live-resolution podem trazer a imagem de volta.

## Goals / Non-Goals

**Goals:**
- Adicionar campo `image_policy` ao modelo `Lesson` (string: `"auto"`, `"none"`, `"custom"`)
- Atualizar admin para usar seletor de política em vez de checkbox `image_active`
- Atualizar frontend (`Lesson.jsx`) para respeitar a política
- Atualizar backfill para pular lições com política diferente de `"auto"`
- Criar migração de dados para popular `image_policy` das lições existentes

**Non-Goals:**
- Não altera os mecanismos de live-resolution (eles continuam existindo para `image_policy="auto"`)
- Não altera o `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, ou catálogo de emojis
- Não remove o campo `image_active` (pode ser removido em change futuro, mas manteremos compatibilidade)

## Decisions

### Decisão 1: Campo string `image_policy` em vez de boolean

**Alternativas consideradas:**
- **Reforçar `image_active`**: Menos código, mas um booleano não consegue expressar os 3 estados necessários (auto, none, custom). Teríamos que adicionar lógica extra para interpretar combinações de `image_active` + `image_url`.
- **Enum do banco**: Mais seguro, mas adiciona complexidade de tipo enumerado no SQLite (usado em dev). String simples resolve com check constraint.
- **Campo `image_policy` como string**: Simples, flexível, legível. Valores limitados a `"auto"`, `"none"`, `"custom"` validados no backend.

**Decisão:** String com validação no backend. O padrão `"auto"` mantém compatibilidade retroativa.

### Decisão 2: Seletor visual no admin em vez de checkbox

O substitui o checkbox `image_active` por um grupo de radio buttons ou `<select>` estilizado com 3 opções claras:

- **🔄 Auto** — "Resolver imagem automaticamente"
- **🚫 Nenhuma** — "Não mostrar imagem"
- **✏️ Personalizada** — "Usar imagem selecionada manualmente"

Isso torna a intenção do admin explícita e visível.

### Decisão 3: Backfill respeita `image_policy`

A função `backfill_lesson_images_force()` só atualizará lições com `image_policy="auto"`. Lições com `"none"` ou `"custom"` são preservadas intactas.

### Decisão 4: Migração heurística para dados existentes

Para lições já existentes no banco, a migration popula `image_policy` assim:

| Condição | `image_policy` |
|---|---|
| `image_active=False` | `"none"` |
| `image_url` resolvido difere do armazenado | `"custom"` |
| Caso contrário (padrão) | `"auto"` |

Isso garante que edições manuais feitas antes da atualização continuem sendo respeitadas.

### Decisão 5: Remover `image_active` gradualmente

O campo `image_active` não será removido agora — apenas ignorado quando `image_policy` estiver presente. Futuramente pode ser deprecado. Isso evita quebrar código existente que ainda referencia o campo.

## Risks / Trade-offs

- **Risco**: Lições existentes com `image_active=False` podem ter `image_url` populado. A migração setará `image_policy="none"`, e o frontend limpará a exibição. **Mitigação**: A migração já cobre esse caso.
- **Risco**: Admin pode se confundir com 3 opções em vez de 1 checkbox. **Mitigação**: Rótulos claros e descritivos; tooltip explicativo.
- **Risco**: Código existente que ainda usa `image_active` pode ter comportamento inesperado. **Mitigação**: Manter `image_active` como campo, mas o frontend passa a priorizar `image_policy`. Nenhum código é removido, apenas a UI do admin é alterada.
