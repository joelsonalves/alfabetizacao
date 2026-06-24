# content-cms-backend Specification

## Purpose
TBD - created by archiving change content-management-system. Update Purpose after archive.
## Requirements
### Requirement: Lesson model gains content-management fields

The `Lesson` model SHALL have these new columns added:
- `active`: Boolean, default `True`
- `image_url`: String(500), nullable
- `image_active`: Boolean, default `True`
- `alt_text`: String(500), nullable
- `placeholder_text`: String(200), nullable

#### Scenario: Active defaults to true
- **WHEN** a new lesson is created without specifying `active`
- **THEN** `lesson.active` SHALL be `True`

#### Scenario: Image fields are nullable
- **WHEN** a lesson is created without `image_url`, `alt_text`, or `placeholder_text`
- **THEN** those fields SHALL be `NULL` in the database

### Requirement: LessonImage table is migrated and dropped

Alembic migration SHALL:
1. Add the new columns to `lessons`
2. Copy `lesson_images.image_url` → `lessons.image_url` for matching rows
3. Set `lessons.alt_text` = `lesson_images.reference` as fallback where missing
4. Set `lessons.active = True`, `lessons.image_active = True` for all existing rows
5. Drop `lesson_images` table

#### Scenario: Migration copies existing image data
- **GIVEN** a lesson with a related LessonImage with `image_url = "/emoji/A.png"`
- **WHEN** the migration runs
- **THEN** `lesson.image_url` SHALL be `"/emoji/A.png"`

#### Scenario: LessonImage table no longer exists
- **WHEN** migration completes
- **THEN** `lesson_images` table SHALL NOT exist in the database

### Requirement: Seed populates new fields

`seed.py` SHALL set:
- `active = True` for all lessons
- `image_active = True` for all lessons
- `alt_text` generated per type:
  - `letter` / `consonant`: `"Letra {target}"`
  - `syllable`: `"Sílaba {target}"`
  - `blending` / `word`: `"Palavra {target}"`
  - `phrase`: `"{target}"`
  - `sentence`: `"{target}"`
- `placeholder_text` generated per type:
  - `letter` / `consonant`: `"Digite a letra {target}"`
  - `syllable`: `"Digite a sílaba {target}"`
  - `blending` / `word`: `"Digite a palavra {target}"`
  - `phrase` / `sentence`: `"Digite a frase"`

#### Scenario: Seed sets alt_text for letters
- **WHEN** seed creates lesson with target="A" and lesson_type="letter"
- **THEN** `lesson.alt_text` SHALL be `"Letra A"`

#### Scenario: Seed sets alt_text for words
- **WHEN** seed creates lesson with target="CASA" and lesson_type="word"
- **THEN** `lesson.alt_text` SHALL be `"Palavra CASA"`

### Requirement: LessonResponse includes new fields

The `LessonResponse` schema SHALL include: `active`, `image_url`, `image_active`, `alt_text`, `placeholder_text`.

#### Scenario: API returns new fields
- **WHEN** `GET /lessons/{id}` is called
- **THEN** the response SHALL contain `active`, `image_url`, `image_active`, `alt_text`, `placeholder_text`

### Requirement: LessonCreate and LessonUpdate schemas exist

`LessonCreate` SHALL have all writable fields (module_id, name, lesson_type, target, content, active, image_url, image_active, alt_text, placeholder_text, sort_order).
`LessonUpdate` SHALL have all fields optional.

#### Scenario: Create lesson with all fields
- **WHEN** `POST /admin/lessons` is called with complete body
- **THEN** a new lesson SHALL be created with those values

#### Scenario: Update only active field
- **WHEN** `PATCH /admin/lessons/{id}` is called with `{"active": false}`
- **THEN** only the `active` field SHALL change

### Requirement: GET /admin/lessons lists lessons with filters

Protected by `require_admin`. Supports query params: `module_id`, `module_type`, `active`.

#### Scenario: Admin lists all lessons
- **WHEN** admin calls `GET /admin/lessons`
- **THEN** all lessons are returned regardless of active status

#### Scenario: Filter by module_id
- **WHEN** admin calls `GET /admin/lessons?module_id=1`
- **THEN** only lessons belonging to module 1 are returned

### Requirement: POST /admin/lessons creates a lesson

Protected by `require_admin`. Accepts `LessonCreate` body.

#### Scenario: Admin creates a new lesson
- **WHEN** admin sends `POST /admin/lessons` with valid body
- **THEN** a new lesson SHALL be created with HTTP 201
- **AND** the response SHALL include the new lesson's ID

### Requirement: PATCH /admin/lessons/{id} updates a lesson

Protected by `require_admin`. Accepts `LessonUpdate` body. Returns 404 if not found.

#### Scenario: Admin toggles lesson active
- **WHEN** admin calls `PATCH /admin/lessons/1` with `{"active": false}`
- **THEN** `lesson.active` SHALL be `false`
- **AND** the response SHALL reflect the updated state

#### Scenario: Admin updates image
- **WHEN** admin calls `PATCH /admin/lessons/1` with `{"image_url": "https://example.com/img.png", "alt_text": "Nova imagem"}`
- **THEN** both fields SHALL be updated

#### Scenario: Update non-existent returns 404
- **WHEN** admin calls `PATCH /admin/lessons/99999`
- **THEN** SHALL return HTTP 404

### Requirement: DELETE /admin/lessons/{id} deletes a lesson

Protected by `require_admin`. Returns 204 on success, 404 if not found.

#### Scenario: Admin deletes lesson
- **WHEN** admin calls `DELETE /admin/lessons/1`
- **THEN** the lesson SHALL be deleted with HTTP 204

### Requirement: Admin CRUD for modules

| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/modules | List all modules |
| POST | /admin/modules | Create module with `ModuleCreate` |
| PATCH | /admin/modules/{id} | Update module with `ModuleUpdate` |
| DELETE | /admin/modules/{id} | Delete module and cascade lessons |

All protected by `require_admin`.

#### Scenario: Create module
- **WHEN** admin sends `POST /admin/modules` with valid body
- **THEN** a new module SHALL be created

#### Scenario: Delete module cascades
- **WHEN** admin deletes a module with lessons
- **THEN** all associated lessons SHALL also be deleted

### Requirement: GET /modules/{module_id}/lessons filters inactive

When `feature-flags` system indicates the module is visible, this endpoint SHALL return only lessons where `active = True`.

#### Scenario: Inactive lesson is hidden from public
- **GIVEN** a lesson has `active = false`
- **WHEN** `GET /modules/1/lessons` is called
- **THEN** that lesson SHALL NOT appear in the response

#### Scenario: All active lessons appear
- **GIVEN** all lessons have `active = true`
- **WHEN** `GET /modules/1/lessons` is called
- **THEN** all lessons SHALL appear in the response

