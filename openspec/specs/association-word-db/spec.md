# association-word-db Specification

## Purpose
TBD - created by archiving change association-word-db. Update Purpose after archive.
## Requirements
### Requirement: Coluna association_word na tabela lessons

O modelo `Lesson` DEVE ter uma coluna `association_word VARCHAR(100)` armazenando a palavra associada à lição (ex: "xícara" para a letra X, "abelha" para a letra A).

A coluna DEVE ser nullable — lições que não são do tipo letter/consonant podem ter `association_word = null`.

#### Scenario: Coluna existe no banco

- **WHEN** a migration `0005_add_association_word.py` é executada
- **THEN** a tabela `lessons` DEVE ter a coluna `association_word VARCHAR(100) nullable`

#### Scenario: Rollback remove a coluna

- **WHEN** a migration é revertida (`alembic downgrade -1`)
- **THEN** a coluna `association_word` DEVE ser removida da tabela `lessons`

---

### ⚠️ Requirement: Backward Compatibility do Modelo (CRÍTICO)

**Problema:** O modelo SQLAlchemy declara `association_word = Column(String(100), nullable=True)`, mas a migration ainda não foi executada no PostgreSQL. SQLAlchemy faz `SELECT lessons.*` (incluindo `association_word`), o que lança `column lessons.association_word does not exist` e quebra TODAS as queries de lições.

**Solução:** Até a migration ser executada, o atributo `association_word` no modelo **não deve ser incluído em queries SELECT**. Exige uma de duas estratégias:

#### Estratégia A (Recomendada): Coluna comentada + ativação manual

Antes de rodar `alembic upgrade head`:

1. **`backend/app/models/module.py`**: Comentar a linha `association_word = Column(String(100), nullable=True)`.
2. **`backend/app/schemas/module.py`**: Remover `association_word` de `LessonResponse`. Manter em `LessonCreate`/`LessonUpdate` (são ignorados se não houver coluna).

Depois de rodar a migration:

3. **`backend/app/models/module.py`**: Descomentar a coluna.
4. **`backend/app/schemas/module.py`**: Adicionar `association_word` de volta a `LessonResponse`.
5. Rodar backfill: `python3 -c "from app.database import SessionLocal; from app.services.backfill_lesson_images import backfill_association_words; db = SessionLocal(); c = backfill_association_words(db); print(c, 'atualizadas'); db.close()"`

#### Estratégia B: Usar `with_entities` para excluir coluna da query

Alternativa mais limpa: modificar o endpoint de listagem de lessons para carregar apenas as colunas que realmente existem no banco, sem a coluna de modelo. Esta abordagem permite manter o `association_word` no modelo sem quebrar queries.

**Risco:** Complexidade extra, manutenção frágil.

#### Scenario: Modelo sem coluna (pré-migration)

- **GIVEN** a migration `0005` NÃO foi executada
- **WHEN** qualquer query de lessons é executada
- **THEN** NÃO DEVE fazer SELECT de `association_word`
- **AND** a API DEVE retornar lições normalmente

#### Scenario: Modelo com coluna (pós-migration)

- **GIVEN** a migration `0005` FOI executada
- **AND** a coluna está descomentada no modelo
- **AND** `association_word` está em `LessonResponse`
- **WHEN** qualquer query de lessons é executada
- **THEN** DEVE retornar `association_word` com o valor do banco

---

### Requirement: Dicionário LETTER_ASSOCIATION no backend

O módulo `backend/app/services/images.py` DEVE conter um dicionário `LETTER_ASSOCIATION` mapeando letras maiúsculas à palavra associada em português.

O dicionário DEVE ter entrada para todas as 26 letras do alfabeto.

A função `get_association_for_letter(letter: str) -> str | None` DEVE retornar a palavra associada.

#### Scenario: Todas as letras têm associação

- **WHEN** a função `get_association_for_letter` é chamada para cada letra A-Z
- **THEN** DEVE retornar uma string não-nula para todas as 26 letras

#### Scenario: Associação de X

- **WHEN** `get_association_for_letter("X")` é chamada
- **THEN** DEVE retornar `"xícara"`

#### Scenario: Letra minúscula é normalizada

- **WHEN** `get_association_for_letter("a")` é chamada
- **THEN** DEVE retornar o mesmo valor que `get_association_for_letter("A")`

---

### Requirement: Seed popula association_word

A função `get_lesson_image_fields` em `backend/app/services/seed.py` DEVE incluir `association_word` no dicionário retornado para lições do tipo `letter` e `consonant`.

O seed (`MODULES_DATA`) DEVE usar `get_lesson_image_fields` (já usa) — nenhuma mudança adicional no seed é necessária.

#### Scenario: Lição do tipo letter tem association_word

- **WHEN** `get_lesson_image_fields("letter", "A")` é chamada
- **THEN** o resultado DEVE conter `association_word` com valor `"abelha"`

#### Scenario: Lição do tipo review não tem association_word

- **WHEN** `get_lesson_image_fields("review", "AEIOU")` é chamada
- **THEN** o resultado DEVE conter `association_word` como `None`

---

### Requirement: Backfill preenche association_word

O script `backend/app/services/backfill_lesson_images.py` DEVE preencher `association_word` para lições dos tipos `letter` e `consonant` que estiverem com `association_word = null`.

#### Scenario: Backfill preenche letras sem association_word

- **WHEN** `resolve_image_for_lesson` é chamada para uma lição do tipo "letter" com target "A"
- **THEN** `association_word` DEVE ser definido como `"abelha"`

---

### Requirement: Lesson.jsx usa association_word do banco

O componente `Lesson.jsx` DEVE usar o campo `association_word` da lição (vindo do banco) para exibir o texto "X → de Xícara" e para passar ao TTS.

Se `association_word` for `null` ou `undefined`, DEVE usar `LETTER_WORDS` do `speech.js` como fallback.

#### Scenario: association_word presente

- **WHEN** a lição tem `association_word = "xícara"`
- **THEN** o texto exibido DEVE ser `"X → de Xícara"`
- **AND** o TTS DEVE falar `"X... de Xícara."`

#### Scenario: association_word ausente (fallback)

- **WHEN** a lição tem `association_word = null`
- **THEN** o texto DEVE usar `LETTER_WORDS["X"]` (fallback para "xis")

---

### Requirement: Admin permite editar association_word

O formulário de edição e criação de lições no admin DEVE incluir um campo de texto para `association_word`.

#### Scenario: Campo association_word no formulário

- **WHEN** um admin edita uma lição do tipo letter
- **THEN** o formulário DEVE exibir um campo `Palavra Associada` pré-preenchido com o valor atual
- **AND** ao salvar, o novo valor DEVE ser persistido no banco

