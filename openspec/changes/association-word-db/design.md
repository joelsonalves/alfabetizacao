## Context

O texto exibido nas lições (ex: "X → de Xis") e a fala do TTS usam `LETTER_WORDS`, um dicionário hardcoded em `frontend/src/constants/speech.js` e `frontend/src/hooks/useSpeech.js`. Esse dicionário está dessincronizado do `EMOJI_MAP` no backend (`images.py`). Quando um emoji é alterado (❌→☕), o texto continua desatualizado porque:

1. `LETTER_WORDS["X"] = "xis"` nunca foi atualizado para "xícara"
2. Não há mecanismo para o admin corrigir a palavra sem editar código
3. As palavras são definidas em dois lugares (speech.js + useSpeech.js), duplicando a manutenção

A solução é armazenar a palavra associada (`association_word`) no banco de dados, por lição, tornando-a editável via admin e sincronizada com o seed.

## Goals / Non-Goals

**Goals:**
- Adicionar coluna `association_word` à tabela `lessons`
- Criar `LETTER_ASSOCIATION` no backend como fonte única da verdade
- Popular `association_word` no seed e no backfill
- Lesson.jsx usar `association_word` do banco em vez de `LETTER_WORDS`
- useSpeech.js aceitar palavra como parâmetro em vez de consultar dicionário
- Admin permitir edição de `association_word`

**Non-Goals:**
- Não remover `LETTER_WORDS` do frontend — mantido como fallback
- Não alterar a API pública (`GET /api/images`, etc.)
- Não alterar o comportamento de lições que não são do tipo letter/consonant
- Não criar um endpoint separado para association words (vem junto com a lição)

## Decisions

### 1. Fonte da palavra: `LETTER_ASSOCIATION` no backend
- **Decisão:** Novo dicionário `LETTER_ASSOCIATION` em `images.py`, espelhando `EMOJI_MAP`
- **Alternativa:** Derivar a palavra do emoji dinamicamente (ex: lookup reverso)
- **Racional:** Dicionário explícito é mais previsível e permite palavras que não são o nome direto do emoji (ex: "X" → "xícara" em vez de "café")

### 2. Armazenamento: coluna na tabela `lessons`
- **Decisão:** `association_word VARCHAR(100)` na tabela `lessons`
- **Alternativa:** Tabela separada `lesson_associations` ou usar `alt_text` existente
- **Racional:** Coluna direta é mais simples; `alt_text` tem semântica diferente (acessibilidade, não exibição)

### 3. Fallback no frontend
- **Decisão:** Se `association_word` for null, usar `LETTER_WORDS` como antes
- **Racional:** Lições existentes sem backfill continuam funcionando; seed de tipos não-letra (phrase, sentence) não precisam de palavra associada

### 4. useSpeech.js: parâmetro opcional
- **Decisão:** `speakLetterWithWord(letter, word?)` aceita palavra opcional
- **Alternativa:** Modificar hook para buscar lição atual no contexto
- **Racional:** Mais simples e sem acoplamento; cada caller passa a palavra que tem

## Migration Plan

1. Criar migration Alembic `0005_add_association_word.py`
2. **Comentar/remover `association_word` do modelo e LessonResponse** (backward compat)
3. Rodar `alembic upgrade head`
4. **Descomentar coluna no modelo e readicionar a LessonResponse**
5. Executar backfill para popular lições existentes
6. Rollback: `alembic downgrade -1` (remove coluna)

## Risks / Trade-offs

- **⚠️ Quebra se migration não rodar antes de usar o modelo** → Coluna no modelo sem migration executa SELECT em coluna inexistente. **Mitigação:** coluna fica comentada no modelo até migration ser rodada.
- **Duplicação entre `LETTER_ASSOCIATION` e `LETTER_WORDS`** → `LETTER_WORDS` vira fallback apenas; `LETTER_ASSOCIATION` é a fonte primária
- **Lições sem backfill** → fallback no frontend garante que não quebra
- **Tipos de lição não-letra** → `association_word` fica null, sem impacto
- **Tradução/idioma** → a palavra associada está em português, consistente com o resto do app
