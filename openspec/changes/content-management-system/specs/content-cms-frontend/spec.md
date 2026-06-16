## ADDED Requirements

### Requirement: Admin page has tab navigation

The `/admin` page SHALL display three tabs:
1. **Flags** – existing feature flag management (unchanged)
2. **Módulos** – CRUD for LearningModules
3. **Conteúdo** – CRUD for Lessons within a module

Tab state SHALL be URL-based: `/admin?tab=flags`, `/admin?tab=modules`, `/admin?tab=content`.

#### Scenario: Default tab is Flags
- **WHEN** admin navigates to `/admin` without tab param
- **THEN** the Flags tab SHALL be active

#### Scenario: Tab switching
- **WHEN** admin clicks "Conteúdo" tab
- **THEN** the URL SHALL update to `/admin?tab=content`
- **AND** the Content panel SHALL render

### Requirement: Módulos tab lists modules with CRUD

The Módulos tab SHALL:
- Fetch `GET /admin/modules` on mount
- Display each module as a card/row with name, type, description, sort_order
- Provide "Edit" and "Delete" buttons per module
- Provide a "Novo Módulo" button that opens a form/modal

#### Scenario: Modules list loads
- **WHEN** admin opens the Módulos tab
- **THEN** all modules are displayed in a list

#### Scenario: Admin creates a module
- **WHEN** admin clicks "Novo Módulo", fills form, and submits
- **THEN** `POST /admin/modules` is called
- **AND** the new module appears in the list

#### Scenario: Admin deletes a module
- **WHEN** admin clicks "Delete" on a module
- **THEN** a confirmation dialog SHALL appear
- **AND** on confirm, `DELETE /admin/modules/{id}` is called
- **AND** the module is removed from the list

### Requirement: Conteúdo tab lists lessons with CRUD

The Conteúdo tab SHALL:
- Show a dropdown to select a module
- Fetch `GET /admin/lessons?module_id=X` on module select
- Display a table with columns: Ativo, Nome, Alvo, Imagem (thumbnail), Alt Text, Ordem, Ações
- Clicking a row SHALL expand into an inline edit form
- "Novo Item" button SHALL open a creation form

#### Scenario: Select module loads lessons
- **WHEN** admin selects "Vogais" from the dropdown
- **THEN** `GET /admin/lessons?module_id=1` is called
- **AND** the 6 vowel lessons are displayed in a table

#### Scenario: Toggle active inline
- **WHEN** admin clicks the "Ativo" checkbox for a lesson
- **THEN** `PATCH /admin/lessons/{id}` is called with the new active state
- **AND** the checkbox reflects the updated state

#### Scenario: Inline edit form
- **WHEN** admin clicks a lesson row
- **THEN** the row expands to show editable fields: name, target, image_url, image_active, alt_text, placeholder_text, sort_order
- **AND** "Salvar" and "Cancelar" buttons are shown

#### Scenario: Admin creates a new lesson
- **WHEN** admin clicks "Novo Item" and submits the form
- **THEN** `POST /admin/lessons` is called with the selected module_id
- **AND** the new lesson appears in the table

#### Scenario: Admin deletes a lesson
- **WHEN** admin clicks "Excluir" on a lesson
- **THEN** a confirmation dialog appears
- **AND** on confirm, `DELETE /admin/lessons/{id}` is called
- **AND** the lesson is removed from the table

### Requirement: Lesson.jsx uses image_url, alt_text, placeholder_text from API

The Lesson component SHALL:
- Read `image_url`, `image_active`, `alt_text`, `placeholder_text` from the lesson object
- If `image_url` is present and `image_active === true`: display the image with `alt_text` as the `<img alt="">`
- If `image_url` is present and `image_active === false`: do NOT display the image, show a text indicator instead
- If `image_url` is null: fall back to emoji from the client-side `EMOJI_MAP`
- Use `placeholder_text` as the keyboard/input placeholder where applicable

#### Scenario: Lesson with image and alt
- **GIVEN** lesson has `image_url = "https://example.com/a.png"`, `alt_text = "Letra A"`, `image_active = true`
- **WHEN** the lesson loads
- **THEN** the image is displayed with `alt="Letra A"`

#### Scenario: Lesson with inactive image
- **GIVEN** lesson has `image_url = "https://example.com/a.png"`, `image_active = false`
- **WHEN** the lesson loads
- **THEN** the image is NOT rendered
- **AND** a placeholder/indicator is shown instead

#### Scenario: Lesson without image falls back to emoji
- **GIVEN** lesson has `image_url = null`, target = "A"
- **WHEN** the lesson loads
- **THEN** the emoji 🐝 (from client-side EMOJI_MAP) is displayed

### Requirement: ImageDisplay.jsx accepts new props

`ImageDisplay` SHALL accept:
- `url` (string|null)
- `alt` (string|null)
- `active` (boolean, default true)
- `fallback` (ReactNode, optional)
- `placeholder` (string, optional)

#### Scenario: ImageDisplay shows image when active
- **WHEN** `url` is set and `active` is true
- **THEN** `<img src={url} alt={alt || ''} />` is rendered

#### Scenario: ImageDisplay shows nothing when inactive
- **WHEN** `active` is false
- **THEN** the placeholder text (if provided) or nothing is rendered

#### Scenario: ImageDisplay with no url shows fallback
- **WHEN** `url` is null and `fallback` is provided
- **THEN** the fallback ReactNode is rendered

### Requirement: Lesson.jsx does not display inactive items

Though the public endpoint filters inactive lessons, if a lesson somehow loads with `active === false`, the Lesson component SHALL redirect to `/dashboard`.

#### Scenario: Direct access to inactive lesson
- **GIVEN** a lesson has `active = false`
- **WHEN** user navigates to `/lesson/1/999` directly
- **THEN** the user SHALL be redirected to `/dashboard`
