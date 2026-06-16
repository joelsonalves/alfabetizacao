## Summary

Transform the learning content from hardcoded data (seed.py, emoji maps) into a fully
database-driven system. Every vowel, consonant, syllable, word, phrase, sentence, and
blending item becomes a record in the `lessons` table with editable fields for
active state, image, alt text, and placeholder text. The Admin page gains CRUD tabs
so the administrator can create, edit, activate/deactivate, and delete any content item
without touching code.

## Motivation

- Hoje o conteúdo é definido em `seed.py` e `images.py` – alterações exigem deploy
- Não há como desativar um item específico (ex: uma palavra problemática)
- Não há como customizar imagem, alt text ou placeholder por item
- Acessibilidade limitada: alt text genérico, sem placeholder configurável
- Admin não tem autonomia sobre o conteúdo pedagógico

## Scope

### What IS in scope

- Estender modelo `Lesson` com colunas: `active`, `image_url`, `image_active`, `alt_text`, `placeholder_text`
- Migrar dados de `LessonImage` para a `Lesson` correspondente e remover tabela `lesson_images`
- Atualizar `seed.py` para popular os novos campos (active = True para tudo)
- NOVOS endpoints admin: CRUD completo de Lessons e Modules
- NOVA aba "Conteúdo" na página `/admin` com:
  - Listagem de módulos (com opção de expandir para ver itens)
  - CRUD de itens: criar, editar, ativar/desativar, deletar
  - Editor de imagem (URL + toggle) e campos de acessibilidade (alt, placeholder)
- Atualizar frontend (Dashboard, Lesson) para respeitar `active` e usar alt/placeholder do DB
- Atualizar `GET /modules/{id}/lessons` para filtrar itens inativos de acordo com feature flags

### What is NOT in scope

- Sistema de versionamento de conteúdo (git-like history)
- Upload de imagens (o admin informa URL externa)
- Drag-and-drop reordering (feito via sort_order numérico)
- Múltiplas imagens por item (1 item = 1 imagem)
- Internacionalização dos textos de acessibilidade

## Backend changes

### Models

````python
# Lesson gains these columns:
active          = Column(Boolean, default=True)
image_url       = Column(String(500), nullable=True)
image_active    = Column(Boolean, default=True)
alt_text        = Column(String(500), nullable=True)
placeholder_text = Column(String(200), nullable=True)

# LessonImage table is DROPPED after migration
````

### New schemas

````python
class LessonCreate(BaseModel):
    module_id: int
    name: str
    lesson_type: str
    target: str
    content: Any | None = None
    active: bool = True
    image_url: str | None = None
    image_active: bool = True
    alt_text: str | None = None
    placeholder_text: str | None = None
    sort_order: int

class LessonUpdate(BaseModel):
    name: str | None = None
    active: bool | None = None
    image_url: str | None = None
    image_active: bool | None = None
    alt_text: str | None = None
    placeholder_text: str | None = None
    sort_order: int | None = None

class ModuleCreate(BaseModel):
    name: str
    module_type: str
    description: str | None = None
    sort_order: int

class ModuleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    sort_order: int | None = None
````

### New admin endpoints (prefix: /admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/modules | List all modules |
| POST | /admin/modules | Create module |
| PATCH | /admin/modules/{id} | Update module |
| DELETE | /admin/modules/{id} | Delete module (with lessons) |
| GET | /admin/lessons | List lessons (filter: ?module_id, ?module_type, ?active) |
| POST | /admin/lessons | Create lesson |
| PATCH | /admin/lessons/{id} | Update lesson (toggle active, change image/alt, etc.) |
| DELETE | /admin/lessons/{id} | Delete lesson |

All protected by `require_admin`.

### Updated public endpoints

| Method | Path | Change |
|--------|------|--------|
| GET | /modules/{id}/lessons | Only returns lessons where `active = True` |
| GET | /lessons/{id} | Returns complete lesson data (including image_url, alt_text, etc.) |
| GET | /images/emoji/{letter} | Can be deprecated – emoji data now in DB |
| GET | /images/word/{word} | Can be deprecated – image data now in DB |

### Seed migration

- `seed.py` SHALL populate `active = True`, `image_active = True` for all existing items
- `seed.py` SHALL generate `alt_text` based on target (e.g. "Letra A", "Palavra CASA", "Sílaba BA")
- `seed.py` SHALL generate `placeholder_text` based on lesson_type
- Emoji data moves from `images.py` dict into the DB (populated by seed)

## Frontend changes

### Admin page (new tab)

The `/admin` page gains a tab navigation:
1. **Flags** (existing) – manage feature flags
2. **Módulos** – list/create/edit/delete LearningModules
3. **Conteúdo** – list/create/edit/delete Lessons within a selected module

The "Conteúdo" tab SHALL:
- Show a module selector dropdown
- Display a table of lessons for the selected module
- Each row: name, target, active toggle, image (thumbnail), alt text preview
- Click to expand/edit: inline form for all fields
- "Novo item" button to create a lesson
- Delete with confirmation

### Lesson.jsx changes

- Fetch `image_url`, `alt_text`, `placeholder_text` directly from the lesson API response
- Use `alt_text` for the `<img alt="">` attribute
- Use `placeholder_text` for the keyboard/virtual keyboard placeholder (if applicable)
- If `image_active === false`, skip displaying the image even if `image_url` is set
- If `active === false` on a lesson (should not happen because the public endpoint filters), redirect

### ImageDisplay.jsx changes

- Accept new props: `imageActive`, `placeholderText`
- If `imageActive === false`, render placeholder text instead of image
- If `image_url` is present and `imageActive === true`, render the image with `alt_text`

### Dashboard.jsx changes

- Continue using the existing feature flag system for module-level visibility
- No change needed at Dashboard level (item-level filtering happens inside Lesson)

## Data migration

Alembic migration script SHALL:
1. Add columns to `lessons`: `active`, `image_url`, `image_active`, `alt_text`, `placeholder_text`
2. Copy data from `lesson_images` into `lessons`:
   - `lesson.image_url = lesson_image.image_url`
   - `lesson.image_active = True`
   - `lesson.alt_text = lesson_image.reference` (as fallback)
3. Set defaults: `active = True`, `image_active = True` for all existing rows
4. Generate `alt_text` for rows that have none (based on target + lesson_type)
5. Drop `lesson_images` table

## Risk assessment

| Risk | Mitigation |
|------|------------|
| Migration deletes LessonImage data | Migration copies data before dropping |
| Frontend breaks if alt_text is null | Lesson.jsx falls back to `target` as alt text |
| Admin CRUD mistakes (deleting wrong item) | Confirmation dialog, soft-delete not planned (user chose full CRUD) |
| Seed conflict with new columns | Seed updated to populate all new fields |

## Future considerations

- Search/filter in admin content tab (paginate if many items)
- Bulk activate/deactivate by module
- CSV import/export of content
- Image upload (store in S3/minio instead of URL)
