## Overview

This change transforms `Lesson` from a read-only entity populated by seed into a fully
editable content record. The Admin page grows from a single feature-flag table to a
multi-tab content management interface. The `LessonImage` table is absorbed into `Lesson`
and retired.

## Architecture

```mermaid
flowchart TB
    subgraph Admin
        A[Admin Page\n/admin]
        A --> B[Aba Flags\nfeature_flags CRUD]
        A --> C[Aba Módulos\nlearning_modules CRUD]
        A --> D[Aba Conteúdo\nlessons CRUD]
    end

    subgraph Public
        E[Dashboard]
        F[Lesson Player]
        G[ImageDisplay]
    end

    subgraph Backend
        H[GET /feature-flags]
        I[GET /modules]
        J[GET /modules/{id}/lessons]
        K[GET /lessons/{id}]
        L[PATCH /admin/feature-flags/{key}]
        M[CRUD /admin/modules]
        N[CRUD /admin/lessons]
    end

    B --> L
    C --> M
    D --> N
    E --> I
    E --> J
    F --> K
    F --> G
```

## Data model

### Lesson (extended)

```
lessons
├── id              : Integer, PK
├── module_id       : Integer, FK → learning_modules.id
├── name            : String(100)       # "Vogal A", "Palavra CASA"
├── lesson_type     : String(50)        # letter, consonant, syllable, blending, word, phrase, sentence
├── target          : String(100)       # "A", "CASA", "O GATO BEBE"
├── content         : JSON, nullable    # blending: {"syllables":["CA","SA"],"word":"CASA"}
├── sort_order      : Integer
├── active          : Boolean, default=True   # ← NEW
├── image_url       : String(500), nullable   # ← NEW (migrated from LessonImage)
├── image_active    : Boolean, default=True   # ← NEW
├── alt_text        : String(500), nullable   # ← NEW
├── placeholder_text: String(200), nullable   # ← NEW
```

### LearningModule (unchanged)

```
learning_modules
├── id              : Integer, PK
├── name            : String(100)
├── module_type     : String(50)        # vowel, consonant, simple_syllable, etc.
├── description     : Text, nullable
├── sort_order      : Integer
```

### LessonImage (removed after migration)

```
lesson_images       ← TO BE DROPPED
├── id
├── lesson_id        → migrated to lesson.image_url
├── reference        → migrated to lesson.alt_text (fallback)
├── image_url        → migrated to lesson.image_url
├── source           → not migrated (always "emoji")
```

## API Design

### Admin endpoints

All under `/admin`, protected by `require_admin` (HTTP 403 if not admin).

```
GET    /admin/modules          → list modules
POST   /admin/modules          → create module
PATCH  /admin/modules/{id}     → update module (name, description, sort_order)
DELETE /admin/modules/{id}     → delete module + cascade lessons

GET    /admin/lessons          → list all lessons (query: ?module_id=&module_type=&active=)
POST   /admin/lessons          → create lesson
PATCH  /admin/lessons/{id}     → update lesson (any field)
DELETE /admin/lessons/{id}     → delete lesson
```

### Public endpoints (modified)

```
GET /modules/{module_id}/lessons
  → now filters out lessons WHERE active = false
  → response includes new fields: image_url, image_active, alt_text, placeholder_text

GET /lessons/{lesson_id}
  → response includes new fields
  → does NOT filter by active (direct access by ID)
```

### Image resolution strategy

1. If `lesson.image_url` is set AND `lesson.image_active = True` → use it
2. If `lesson.image_url` is set AND `lesson.image_active = False` → hide image, show placeholder text
3. If `lesson.image_url` is NULL → fall back to emoji (from the old EMOJI_MAP or DB)
4. `alt_text` is used for `<img alt="">`; if null, use `target` as fallback
5. `placeholder_text` is used for input placeholders in Lesson player

## Admin UI: Tab layout

```
┌──────────────────────────────────────────────────┐
│  /admin                                           │
│  [ Flags ] [ Módulos ] [ Conteúdo ]               │
├──────────────────────────────────────────────────┤
│                                                    │
│  Aba "Conteúdo":                                   │
│  ┌─ Módulo: [Vogais (dropdown)] ─────────────────┐│
│  │  + Novo Item                   [Filtrar ativos]││
│  │                                                ││
│  │  Ativo │ Item        │ Alvo   │ Imagem  │ Alt  ││
│  │  ☑     │ Vogal A     │ A      │ 🐝      │ Letra││
│  │  ☐     │ Vogal E     │ E      │ ⭐      │ Letra││
│  │  ...                                         ││
│  │                                                ││
│  │  [ ✏️ Editar ] ao clicar na linha abre form   ││
│  └────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### Lesson edit form (inline/modal)

```
Nome:        [________________]
Alvo:        [________________]
Ativo:       [☑]
URL Imagem:  [________________]
Exibir img:  [☑]
Texto Alt:   [________________]
Placeholder: [________________]
Ordem:       [____]
[ Salvar ] [ Cancelar ] [ Excluir ]
```

## Seed updates

`seed.py` SHALL be updated to:

1. Set `active = True` for all existing lessons
2. Set `image_active = True` for all existing lessons
3. Generate `alt_text`:
   - letter/consonant: `"Letra {target}"`
   - syllable: `"Sílaba {target}"`
   - blending: `"Palavra {target}"`
   - word: `"Palavra {target}"`
   - phrase/sentence: `"{target}"`
4. Generate `placeholder_text`:
   - letter/consonant: `"Digite a letra {target}"`
   - syllable: `"Digite a sílaba {target}"`
   - word: `"Digite a palavra {target}"`
   - phrase/sentence: `"Digite a frase"`

## Component updates

### Lesson.jsx

```javascript
// Before: fetches image via api.images.emoji() / api.images.word()
// After: uses lesson.image_url directly

// Image display logic:
if (lesson.image_url && lesson.image_active) {
  // show image with lesson.alt_text as alt
} else if (lesson.image_url && !lesson.image_active) {
  // show placeholder text from lesson.placeholder_text
  // or skip image entirely
} else {
  // fallback: emoji from EMOJI_MAP (client-side) or no image
}
```

### ImageDisplay.jsx

New props:
- `url`: image URL (from lesson.image_url)
- `alt`: alt text (from lesson.alt_text)
- `active`: whether to show the image (from lesson.image_active)
- `fallback`: emoji/text to show when inactive or no URL
- `placeholder`: placeholder text to show when hidden

### api.js

```javascript
// New admin methods
admin: {
  ...listFlags, updateFlag,
  listModules, createModule, updateModule, deleteModule,
  listLessons, createLesson, updateLesson, deleteLesson,
}
```

## Migration plan

### Phase 1: Schema + data migration
1. Create Alembic migration
2. Add columns, copy data from lesson_images, drop lesson_images
3. Update seed.py

### Phase 2: Admin CRUD endpoints
1. Create `app/routes/admin_content.py` with module + lesson CRUD
2. Register in `app/main.py`
3. Create schemas for create/update

### Phase 3: Update public endpoints
1. Add new fields to `LessonResponse`
2. Add `active` filter to `list_lessons`

### Phase 4: Frontend admin tab
1. Add tab navigation to Admin.jsx
2. Create ModuleList, LessonList components
3. Wire up CRUD API calls

### Phase 5: Frontend lesson player
1. Update Lesson.jsx to use `image_url`, `alt_text`, `placeholder_text` from API
2. Update ImageDisplay.jsx with new props

## Testing

- Alembic migration test: verify data integrity after migration
- Backend: test admin CRUD endpoints (create → read → update → delete)
- Backend: test that public endpoint filters inactive lessons
- Frontend: test that ImageDisplay shows/hides based on `image_active`
- Frontend: test that alt_text appears in img element
- Manual: full CRUD flow in admin → verify changes reflect in Dashboard/Lesson
