## 1. Modelo e Migration

- [x] 1.1 Adicionar coluna `association_word` ao modelo `Lesson` em `backend/app/models/module.py` (💥 BUG: quebra lições sem a migration)
- [x] 1.2 Criar migration Alembic `0005_add_association_word.py`
- [ ] 1.3 Rodar `alembic upgrade head` (⚠️ PRÉ-REQUISITO: 1.4 antes)

### 🔴 Hotfix: Backward Compatibility

- [ ] 1.4 **Comentar coluna no modelo**: em `backend/app/models/module.py`, comentar `association_word = Column(String(100), nullable=True)` para não quebrar queries enquanto a migration não roda
- [ ] 1.5 **Remover de LessonResponse**: em `backend/app/schemas/module.py`, remover `association_word` de `LessonResponse` (manter em LessonCreate/LessonUpdate — são ignorados sem a coluna)
- [ ] 1.6 **Após migration (1.3)**: descomentar coluna em `module.py` e readicionar a `LessonResponse`
- [ ] 1.7 **Após migration**: rodar backfill → `python3 -c "from app.database import SessionLocal; from app.services.backfill_lesson_images import backfill_association_words; db = SessionLocal(); c = backfill_association_words(db); print(c); db.close()"`
- [ ] 1.8 Limpar cache do navegador e testar que lições carregam

## 2. Backend — LETTER_ASSOCIATION

- [x] 2.1 Adicionar dicionário `LETTER_ASSOCIATION` em `backend/app/services/images.py` (mapeamento A-Z com palavras em português)
- [x] 2.2 Adicionar função `get_association_for_letter(letter: str) -> str | None`

## 3. Backend — Seed e Backfill

- [x] 3.1 Atualizar `get_lesson_image_fields` em `seed.py` para incluir `association_word`
- [x] 3.2 Atualizar `resolve_image_for_lesson` em `backfill_lesson_images.py` para preencher `association_word`

## 4. Frontend — Lesson.jsx

- [x] 4.1 Substituir `LETTER_WORDS[lesson.target]` por `lesson.association_word || LETTER_WORDS[lesson.target]` no texto exibido
- [x] 4.2 Passar `association_word` para `speakLetterWithWord`

## 5. Frontend — useSpeech.js

- [x] 5.1 `speakLetterWithWord(letter, word?)` aceitar palavra opcional como segundo parâmetro
- [x] 5.2 Se palavra for fornecida, usá-la em vez de `LETTER_WORDS[letter]`

## 6. Frontend — Admin

- [x] 6.1 Adicionar campo `association_word` ao `editForm` e `createForm` no `Admin.jsx`
- [x] 6.2 Adicionar input "Palavra Associada" no formulário de lição
- [x] 6.3 Incluir `association_word` nos schemas LessonCreate/LessonUpdate

## 7. Testes

- [x] 7.1 Verificar que `get_association_for_letter` retorna para todas as 26 letras
- [x] 7.2 Verificar que seed inclui `association_word`
- [x] 7.3 Verificar que backfill preenche `association_word`
- [x] 7.4 Verificar que Lesson.jsx usa `association_word` do banco com fallback
- [x] 7.5 Verificar que admin permite editar `association_word`
- [x] 7.6 Rodar testes existentes (140/140 backend, 176/176 frontend — passando)

## 8. Pós-implementação (edição manual no frontend)

- [ ] 8.1 Editar `frontend/src/constants/speech.js`: `'W': 'waffle'` → `'web'` e `'X': 'xis'` → `'xícara'`
- [ ] 8.2 No admin, editar lição 2/24 e definir `association_word = "web"`
