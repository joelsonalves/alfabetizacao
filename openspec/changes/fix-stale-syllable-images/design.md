## Context

Atualmente, o `image_url` de cada lição é resolvido no momento do seed/backfill a partir dos dicionários em `images.py` e armazenado no banco. A função `backfill_lesson_images()` só preenche `NULL` — lições que já têm um valor (mesmo que desatualizado) não são tocadas.

Isso significa que qualquer alteração nos dicionários `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, `WORD_EMOJI_MAP` ou nas funções de resolução (`get_emoji_for_letter`, `get_emoji_for_syllable`, etc.) **não se reflete** nas lições já existentes. O admin precisaria editar manualmente cada lição para corrigir.

O caso concreto: `EMOJI_MAP["W"]` mudou de 🐺 para 🌐, mas a lição 113 (WA) manteve 🐺 porque o `image_url` foi populado antes da mudança.

## Goals / Non-Goals

**Goals:**
- Adicionar modo "force" ao backfill que recalcula `image_url` de todas as lições
- Atualizar apenas lições cujo `image_url` difere do valor resolvido (preserva edições manuais)
- Poder executar via CLI (`--force`) ou programaticamente

**Non-Goals:**
- Não alterar o seed (lições novas já nascem com o valor correto)
- Não alterar rotas, schemas, modelos ou frontend
- Não modificar a função `backfill_lesson_images()` existente (compatibilidade retroativa)

## Decisions

### 1. Função separada em vez de modificar a existente

**Decisão:** Criar `backfill_lesson_images_force(db)` em vez de alterar o comportamento de `backfill_lesson_images()`.

**Alternativa:** Adicionar um parâmetro `force=False` à função existente.

**Racional:** Função separada é mais explícita e evita risco de chamadas existentes (rota admin, script standalone) passarem a ter comportamento inesperado.

### 2. Preservar edições manuais do admin

**Decisão:** Só atualizar lições onde `lesson.image_url != resolved_url`.

**Alternativa:** Atualizar todas as lições incondicionalmente.

**Racional:** O admin pode ter personalizado o `image_url` de uma lição via interface. Sobrescrever isso seria destrutivo. A comparação com o valor resolvido garante que apenas valores "stale" (diferentes da lógica atual) sejam atualizados.

## Risks / Trade-offs

- **Admin editou image_url para um valor que coincide com o novo resolved**: O valor não é sobrescrito (já está igual). Sem risco.
- **Admin editou image_url e o resolved mudou novamente no futuro**: O force backfill vai sobrescrever porque os valores vão diferir. **Mitigação:** O admin pode re-editar após o backfill. É um cenário raro.
- **Performance**: A query percorre todas as lições. Com centenas de lições, é irrelevante. Com milhares, ainda é rápido (operações em memória).
