# Spec: Lesson Image Storage

## Overview

Store and manage lesson image mappings in the database, making them editable via the admin interface.

## Requirements

### R1: Seed must populate image_url for all lesson types

**ID**: R1
**Description**: The `get_lesson_image_fields()` function in `seed.py` must return a non-null `image_url` for every lesson type that has a valid emoji mapping.
**Rationale**: Without this, newly seeded lessons will have `image_url = null`, forcing the frontend to use the fallback API path.

**Acceptance Criteria**:
- [ ] `get_lesson_image_fields("letter", "A")` returns `{"image_url": "🐝", ...}`
- [ ] `get_lesson_image_fields("consonant", "B")` returns `{"image_url": "🏀", ...}`
- [ ] `get_lesson_image_fields("syllable", "BA")` returns `{"image_url": "🍬", ...}`
- [ ] `get_lesson_image_fields("word", "CASA")` returns `{"image_url": "🏠", ...}`
- [ ] `get_lesson_image_fields("blending", "CASA")` returns `{"image_url": "🏠", ...}`
- [ ] `get_lesson_image_fields("phrase", "O GATO BEBE")` returns `{"image_url": "🐱", ...}`
- [ ] `get_lesson_image_fields("sentence", "O GATO BEBEU LEITE.")` returns `{"image_url": "🐱", ...}`
- [ ] `get_lesson_image_fields("review", "AEIOU")` returns `{"image_url": None, ...}`

### R2: Eliminate duplicated dictionaries in seed.py

**ID**: R2
**Description**: `seed.py` must import mapping functions from `images.py` instead of maintaining its own copies of `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, and `WORD_EMOJI_MAP`.
**Rationale**: The duplicated dictionaries in `seed.py` are a maintenance burden — every update to `images.py` must be mirrored in `seed.py`, and they have already drifted apart.

**Acceptance Criteria**:
- [ ] `seed.py` imports and uses `get_emoji_for_letter`, `get_emoji_for_syllable`, `get_emoji_for_word`, `get_emoji_for_text` from `images.py`.
- [ ] All hardcoded dictionary definitions (`EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, `WORD_EMOJI_MAP`, `WORD_IMAGE_QUERIES`) are removed from `seed.py`.
- [ ] Existing seed tests pass without modification.

### R3: Backfill script populates existing lessons

**ID**: R3
**Description**: A script `backend/app/services/backfill_lesson_images.py` must iterate all existing lessons where `image_url IS NULL` and populate it using the resolution logic from `images.py`.
**Rationale**: Existing lessons in production (including the buggy lessons 240 and 248) must be fixed without requiring a full re-seed.

**Acceptance Criteria**:
- [ ] Script idempotent: running it twice produces the same result.
- [ ] Script updates only lessons with `image_url IS NULL`.
- [ ] Script respects lesson type: `letter`/`consonant` → `get_emoji_for_letter`, `syllable` → `get_emoji_for_syllable`, `word` → `get_emoji_for_word`, `blending`/`phrase`/`sentence` → `get_emoji_for_text`.
- [ ] Script returns the count of updated rows.

### R4: Admin API endpoint for backfill

**ID**: R4
**Description**: A new admin endpoint `POST /admin/lessons/backfill-images` must expose the backfill script.
**Rationale**: The admin needs a self-service button to re-resolve images after mapping changes in `images.py`.

**Acceptance Criteria**:
- [ ] Endpoint exists at `POST /admin/lessons/backfill-images`.
- [ ] Protected by `require_admin` (returns 403 if not admin).
- [ ] Returns `{"updated": <count>}` on success.
- [ ] Does NOT overwrite lessons where `image_url` has been manually edited (i.e., where `image_url` differs from the auto-resolved value or where `image_url` was set after the last backfill).

### R5: Admin UI includes image fields

**ID**: R5
**Description**: The `ContentTab` in `Admin.jsx` must include `image_url`, `image_active`, `alt_text`, and `placeholder_text` in both the create and edit forms.
**Rationale**: Without this, the admin cannot change lesson images without editing the database directly.

**Acceptance Criteria**:
- [ ] Edit form (inline) includes text input for `image_url`.
- [ ] Edit form includes checkbox for `image_active`.
- [ ] Edit form includes text input for `alt_text`.
- [ ] Edit form includes text input for `placeholder_text`.
- [ ] Create form (collapsible) includes all four fields.
- [ ] All four fields are sent in `PATCH /admin/lessons/{id}` and `POST /admin/lessons` requests.
- [ ] Table columns include `image_url` (truncated) and `image_active` (badge).
- [ ] A "Re-resolver imagens" button is present in the header.

### R6: Lesson.jsx image resolution with fallback

**ID**: R6
**Description**: `Lesson.jsx` must resolve images in a 3-level cascade: (1) `lesson.image_url` ativo, (2) `lesson.image_url` oculto, (3) fallback para API `api.images.*` por tipo de lição.
**Rationale**: O banco de dados é a fonte primária, mas o fallback via API é uma rede de segurança para lições sem `image_url` (ex: review, lições criadas antes do backfill, ambientes de teste).

**Acceptance Criteria**:
- [ ] When `lesson.image_url` is set AND `image_active !== false`: render the emoji/image directly.
- [ ] When `lesson.image_url` is set AND `image_active === false`: hide the image and show `placeholder_text` instead.
- [ ] When `lesson.image_url` is null AND `lesson_type` is letter/consonant: call `api.images.emoji(target)`.
- [ ] When `lesson.image_url` is null AND `lesson_type` is syllable: call `api.images.syllable(target)`.
- [ ] When `lesson.image_url` is null AND `lesson_type` is word: call `api.images.word(target)`.
- [ ] When `lesson.image_url` is null AND `lesson_type` is phrase/sentence: call `api.images.text(target)`.
- [ ] When `lesson.image_url` is null AND `lesson_type` is review/blending: render no image (null).
- [ ] API calls silently catch errors (`.catch(() => {})`).

### R7: Visual emoji picker in admin

**ID**: R7
**Description**: The admin interface must provide a visual emoji picker (modal with grid) that displays all available emojis grouped by category (letters, syllables, words, phrases) and allows selecting one by clicking.
**Rationale**: Manually typing emoji codes is error-prone and unintuitive. A visual picker improves usability and discoverability of available images.

**Acceptance Criteria**:
- [ ] Backend endpoint `GET /admin/emoji-mappings` returns all emojis from `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, and `WORD_EMOJI_MAP`, grouped by type.
- [ ] Backend endpoint is protected by `require_admin` (returns 403 if not admin).
- [ ] Frontend has an `EmojiPicker` component that renders as a modal.
- [ ] EmojiPicker has tabs for each category: Letras, Sílabas, Palavras, Frases.
- [ ] Each tab displays emojis in a responsive grid (6-8 columns) with emoji + label.
- [ ] EmojiPicker has a search field that filters by key or label in real time.
- [ ] Clicking an emoji in the picker closes the modal and fills `image_url` in the edit/create form.
- [ ] Clicking an emoji also fills `alt_text` with the label if `alt_text` is currently empty.
- [ ] The `image_url` field in the edit and create forms has a button "📂 Escolher" that opens the picker.
- [ ] The picker can be dismissed by clicking "✕ Fechar" or clicking outside the modal.

## Data Schema

No schema changes. Existing `lessons` table fields:

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `image_url` | String(500) | Yes | None | Emoji or image URL for the lesson |
| `image_active` | Boolean | No | `true` | Whether to show the image |
| `alt_text` | String(500) | Yes | None | Alternative text for accessibility |
| `placeholder_text` | String(200) | Yes | None | Placeholder shown when image is hidden |

## API

### `POST /admin/lessons/backfill-images`

**Request**: (empty body)

**Response** (200):
```json
{ "updated": 42 }
```

**Errors**:
- 403: Not an admin user.
- 500: Internal error during backfill.

## Seed pseudocode

```python
from app.services.images import (
    get_emoji_for_letter,
    get_emoji_for_syllable,
    get_emoji_for_word,
    get_emoji_for_text,
)

CMS_DEFAULTS = {
    "active": True,
    "image_active": True,
    "alt_text": None,
    "placeholder_text": None,
}


def get_lesson_image_fields(lesson_type: str, target: str) -> dict:
    fields = dict(CMS_DEFAULTS)
    if lesson_type in ("letter", "consonant"):
        emoji = get_emoji_for_letter(target)
        fields["image_url"] = emoji
        fields["alt_text"] = f"Emoji da letra {target.upper()}" if emoji else None
    elif lesson_type == "syllable":
        emoji = get_emoji_for_syllable(target)
        fields["image_url"] = emoji
        fields["alt_text"] = f"Emoji da sílaba {target.upper()}" if emoji else None
    elif lesson_type == "word":
        emoji = get_emoji_for_word(target)
        fields["image_url"] = emoji
        fields["alt_text"] = f"Emoji de {target}" if emoji else None
    elif lesson_type in ("blending", "phrase", "sentence"):
        emoji = get_emoji_for_text(target)
        fields["image_url"] = emoji
        fields["alt_text"] = f"Emoji de {target}" if emoji else None
    # review → no image (image_url stays None)
    return fields
```

## Backfill pseudocode

```python
# backend/app/services/backfill_lesson_images.py

def resolve_image_for_lesson(lesson_type: str, target: str) -> str | None:
    if lesson_type in ("letter", "consonant"):
        return get_emoji_for_letter(target)
    if lesson_type == "syllable":
        return get_emoji_for_syllable(target)
    if lesson_type == "word":
        return get_emoji_for_word(target)
    if lesson_type in ("blending", "phrase", "sentence"):
        return get_emoji_for_text(target)
    return None


def backfill_lesson_images(db: Session) -> int:
    count = 0
    lessons = db.query(Lesson).filter(Lesson.image_url.is_(None)).all()
    for lesson in lessons:
        url = resolve_image_for_lesson(lesson.lesson_type, lesson.target)
        if url:
            lesson.image_url = url
            count += 1
    db.commit()
    return count
```
