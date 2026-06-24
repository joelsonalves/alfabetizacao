## Why

Atualmente, o admin não tem uma forma explícita e durável de declarar que uma lição **não deve ter imagem alguma**. O campo `image_active` existe, mas:

1. O backfill (`backfill_lesson_images_force()`) ignora `image_active` e re-popula `image_url` mesmo em lições marcadas como ocultas.
2. O frontend faz live-resolution via API quando `image_url` é `null`, exibindo imagem mesmo com `image_active=false`.
3. Não há no banco um registro semântico da intenção do admin — "auto" (resolve automaticamente), "none" (sem imagem), ou "custom" (imagem escolhida manualmente).

Isso é especialmente problemático após a remoção do fallback de sílabas (WA, WE, WI, WO, WU): o backfill limpa `image_url`, mas o frontend live-resolve e a imagem reaparece. O admin precisa de um controle explícito.

## What Changes

1. **Modelo `Lesson`**: Adicionar campo `image_policy: str` com valores `"auto"`, `"none"`, `"custom"` (default `"auto"`).
2. **Admin form**: Substituir checkbox `image_active` por um seletor de política (`<select>` ou radio group) com opções:
   - **Auto** — imagem resolvida automaticamente (comportamento padrão)
   - **Nenhuma** — não mostrar imagem alguma, nem fazer live-resolve
   - **Personalizada** — usar `image_url` fornecido manualmente (emoji ou URL externa)
3. **Frontend `Lesson.jsx`**: Respeitar `image_policy`:
   - `auto`: comportamento atual (usa image_url se existir, live-resolve se null)
   - `none`: não mostrar imagem, não live-resolve. Mostrar `placeholder_text` se existir.
   - `custom`: usar `image_url` exatamente como está. Não live-resolve se for null.
4. **Backfill**: Pular lições com `image_policy != "auto"`.
5. **Seed**: Definir `image_policy="auto"` nas lições criadas.
6. **Migração**: Script de migração para popular `image_policy` baseado em heurística:
   - Se `image_url` não for nulo e diferir do resolvido automaticamente → `"custom"`
   - Se `image_active=false` → `"none"`
   - Caso contrário → `"auto"`

## Capabilities

### New Capabilities
- `admin-image-policy`: Controle explícito de política de exibição de imagens por lição, gerenciável via admin.

## Impact

- **`backend/app/models/module.py`**: Adicionar campo `image_policy` à classe `Lesson`.
- **`backend/app/routes/admin_content.py`**: Atualizar schema de criação/edição de lições para incluir `image_policy`.
- **`backend/app/services/backfill_lesson_images.py`**: Pular lições com `image_policy != "auto"`.
- **`backend/app/services/seed.py`**: Definir `image_policy="auto"` no seed.
- **Frontend `Lesson.jsx`**: Atualizar lógica de exibição para respeitar `image_policy`.
- **Frontend `Admin.jsx`**: Substituir checkbox `image_active` por seletor de política.
- **Banco de dados**: Criar migration para adicionar coluna `image_policy`.
