# admin-image-policy Specification

## Purpose
TBD - created by archiving change admin-image-policy. Update Purpose after archive.
## Requirements
### Requirement: Lesson possui campo image_policy

O modelo `Lesson` DEVE ter um campo `image_policy: str` com valores permitidos:
- `"auto"` — imagem resolvida automaticamente (comportamento padrão, default)
- `"none"` — nenhuma imagem exibida, live-resolution desativado
- `"custom"` — usa `image_url` fornecido manualmente pelo admin

O campo DEVE ter `nullable=False` e `default="auto"`.

#### Scenario: Cria lição com image_policy padrão

- **GIVEN** uma nova lição é criada sem especificar `image_policy`
- **WHEN** a lição é salva
- **THEN** `lesson.image_policy` DEVE ser `"auto"`

#### Scenario: image_policy inválido é rejeitado

- **GIVEN** uma requisição PATCH para `/admin/lessons/{id}` com `image_policy: "invalido"`
- **WHEN** o backend valida o payload
- **THEN** DEVE retornar erro 400 com mensagem indicando valores permitidos

---

### Requirement: Admin permite selecionar política de imagem

O formulário de criação/edição de lição no admin DEVE exibir um seletor (radio group ou `<select>`) com as três opções de `image_policy`:

| Valor | Rótulo | Descrição |
|---|---|---|
| `auto` | 🔄 Auto | Resolver imagem automaticamente |
| `none` | 🚫 Nenhuma | Não mostrar imagem |
| `custom` | ✏️ Personalizada | Usar imagem selecionada manualmente |

O seletor DEVE substituir o checkbox `image_active`.

#### Scenario: Admin seleciona "Nenhuma" e salva

- **GIVEN** o admin acessa o formulário de edição de uma lição
- **WHEN** o admin seleciona "Nenhuma" (`image_policy="none"`) e salva
- **THEN** `lesson.image_policy` DEVE ser `"none"`
- **AND** `lesson.image_url` PODE ser limpo (opcional, a critério do admin)

#### Scenario: Admin seleciona "Personalizada" e escolhe emoji

- **GIVEN** o admin acessa o formulário de edição de uma lição
- **WHEN** o admin seleciona "Personalizada" (`image_policy="custom"`), escolhe um emoji no EmojiPicker e salva
- **THEN** `lesson.image_policy` DEVE ser `"custom"`
- **AND** `lesson.image_url` DEVE ser o emoji escolhido

#### Scenario: Admin seleciona "Auto" e salva sem image_url

- **GIVEN** o admin acessa o formulário de edição de uma lição com `image_policy="auto"` e `image_url=null`
- **WHEN** o admin salva
- **THEN** `lesson.image_policy` DEVE ser `"auto"`
- **AND** `lesson.image_url` DEVE permanecer `null` (será resolvido em runtime pelo frontend)

---

### Requirement: Frontend respeita image_policy ao exibir lição

O componente `Lesson.jsx` (ou equivalente) DEVE consultar `lesson.image_policy` para decidir como exibir a imagem:

#### Comportamento por política

| `image_policy` | `image_url` | Comportamento |
|---|---|---|
| `"auto"` | não nulo | Exibir `image_url` |
| `"auto"` | nulo | Fazer live-resolution via API `/images/*` |
| `"none"` | qualquer | Não exibir imagem. Exibir `placeholder_text` se presente. |
| `"custom"` | não nulo | Exibir `image_url` |
| `"custom"` | nulo | Não exibir imagem (admin escolheu personalizada mas não forneceu) |

#### Scenario: image_policy="none" não faz live-resolution

- **GIVEN** uma lição com `image_policy="none"` e `image_url=null`
- **WHEN** a lição é carregada no frontend
- **THEN** NÃO DEVE chamar as APIs `/images/*` para live-resolution
- **AND** NÃO DEVE exibir imagem alguma
- **AND** DEVE exibir `placeholder_text` se o campo não for nulo/vazio

#### Scenario: image_policy="auto" com image_url=null faz live-resolution

- **GIVEN** uma lição com `image_policy="auto"` e `image_url=null`
- **WHEN** a lição é carregada no frontend
- **THEN** DEVE chamar a API de live-resolution apropriada (`/images/emoji`, `/images/syllable`, etc.)
- **AND** DEVE exibir o emoji retornado pela API

#### Scenario: image_policy="custom" com image_url não nulo

- **GIVEN** uma lição com `image_policy="custom"` e `image_url="🍉"`
- **WHEN** a lição é carregada no frontend
- **THEN** DEVE exibir `"🍉"` sem fazer live-resolution

#### Scenario: image_policy="custom" com image_url nulo

- **GIVEN** uma lição com `image_policy="custom"` e `image_url=null`
- **WHEN** a lição é carregada no frontend
- **THEN** NÃO DEVE fazer live-resolution
- **AND** NÃO DEVE exibir imagem

---

### Requirement: Backfill respeita image_policy

A função `backfill_lesson_images_force(db)` DEVE pular lições cujo `image_policy` NÃO seja `"auto"`.

A função `backfill_lesson_images(db)` (que só preenche `image_url IS NULL`) TAMBÉM DEVE pular lições com `image_policy != "auto"`.

#### Scenario: Backfill não altera lição com image_policy="none"

- **GIVEN** uma lição com `image_policy="none"`, `image_url="🐺"` (qualquer valor)
- **WHEN** `backfill_lesson_images_force()` é executada
- **THEN** `lesson.image_url` NÃO DEVE ser alterado

#### Scenario: Backfill não altera lição com image_policy="custom"

- **GIVEN** uma lição com `image_policy="custom"`, `image_url="🦋"` (escolhido manualmente)
- **WHEN** `backfill_lesson_images_force()` é executada
- **THEN** `lesson.image_url` NÃO DEVE ser alterado

#### Scenario: Backfill atualiza lição com image_policy="auto"

- **GIVEN** uma lição com `image_policy="auto"` e `image_url="🐺"` (desatualizado)
- **WHEN** `backfill_lesson_images_force()` é executada
- **THEN** `lesson.image_url` PODE ser atualizado para o valor resolvido

---

### Requirement: Seed define image_policy="auto"

A função de seed (`get_lesson_image_fields()` ou similar) DEVE definir `image_policy="auto"` para todas as lições criadas.

#### Scenario: Seed cria lição com política auto

- **GIVEN** a função de seed é executada
- **WHEN** uma nova lição é criada
- **THEN** `lesson.image_policy` DEVE ser `"auto"`

---

### Requirement: Migração popula image_policy das lições existentes

A migração (Alembic ou script SQL) DEVE popular `image_policy` para lições existentes com a seguinte heurística:

1. Se `image_active = false` → `image_policy = "none"`
2. Se `image_url` for diferente do valor que seria resolvido por `resolve_image_for_lesson()` → `image_policy = "custom"`
3. Caso contrário → `image_policy = "auto"`

#### Scenario: Lição com image_active=false vira "none"

- **GIVEN** uma lição existente com `image_active=false` e `image_url="🍉"`
- **WHEN** a migração é executada
- **THEN** `lesson.image_policy` DEVE ser `"none"`

#### Scenario: Lição com image_url customizado vira "custom"

- **GIVEN** uma lição existente com `image_active=true`, `image_url="🦋"`, e o valor resolvido automaticamente seria `"🐝"`
- **WHEN** a migração é executada
- **THEN** `lesson.image_policy` DEVE ser `"custom"`

#### Scenario: Lição com image_url automático vira "auto"

- **GIVEN** uma lição existente com `image_active=true`, `image_url="🐝"`, e o valor resolvido automaticamente também é `"🐝"`
- **WHEN** a migração é executada
- **THEN** `lesson.image_policy` DEVE ser `"auto"`

