## Why

O texto exibido nas lições (ex: "X de Xis") e a fala do TTS ("X... de Xis.") usam um dicionário hardcoded (`LETTER_WORDS` em `speech.js` e `useSpeech.js`) que não reflete as associações definidas no backend (`EMOJI_MAP`). Quando um emoji é alterado (ex: ❌→☕), o texto continue desatualizado ("xis" em vez de "xícara"). Professores não têm como corrigir isso sem editar código.

## What Changes

- **Nova coluna `association_word`** na tabela `lessons` (migration Alembic)
- **Dicionário `LETTER_ASSOCIATION`** em `images.py` como fonte única da verdade para a palavra associada a cada letra, sílaba, palavra e frase
- **Seed e backfill** atualizados para popular `association_word`
- **Lesson.jsx**: usar `association_word` do banco em vez de `LETTER_WORDS` hardcoded
- **useSpeech.js**: `speakLetterWithWord` aceitar parâmetro opcional com a palavra
- **Admin**: campo `association_word` editável no formulário de lição
- Fallback para `LETTER_WORDS` mantido quando `association_word` for null (lições existentes até o backfill)

## Capabilities

### New Capabilities
- `association-word-db`: Armazenamento da palavra associada a cada lição no banco de dados, com seed automático, backfill e edição via admin

### Modified Capabilities
<!-- Nenhuma capacidade existente tem requisitos alterados -->

## Impact

- **`backend/app/models/module.py`**: Adicionar coluna `association_word`
- **`backend/alembic/versions/`**: Nova migration `0005_add_association_word.py`
- **`backend/app/services/images.py`**: Adicionar `LETTER_ASSOCIATION` dict e função `get_association_word()`
- **`backend/app/services/seed.py`**: `get_lesson_image_fields` incluir `association_word`
- **`backend/app/services/backfill_lesson_images.py`**: Preencher `association_word` em lições existentes
- **`backend/app/routes/admin_content.py`**: Schemas LessonCreate/LessonUpdate incluem `association_word`
- **`frontend/src/pages/Lesson.jsx`**: Usar `association_word` da lição em vez de `LETTER_WORDS`
- **`frontend/src/hooks/useSpeech.js`**: `speakLetterWithWord` aceitar palavra como parâmetro
- **`frontend/src/constants/speech.js`**: Manter `LETTER_WORDS` como fallback apenas
- **`frontend/src/pages/Admin.jsx`**: Campo `association_word` no formulário de lição
- Nenhuma breaking change na API
