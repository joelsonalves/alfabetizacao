## Fase 1: Seed

- [x] 1.1 Importar `get_emoji_for_letter`, `get_emoji_for_syllable`, `get_emoji_for_word`, `get_emoji_for_text` de `images.py` no `seed.py`.
- [x] 1.2 Remover dicionários duplicados de `seed.py` (`EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, `WORD_EMOJI_MAP`, `WORD_IMAGE_QUERIES`).
- [x] 1.3 Atualizar `get_lesson_image_fields()` para usar as funções importadas e cobrir `blending`, `phrase`, `sentence`.
- [x] 1.4 Atualizar `generate_simple_syllables()` e `generate_complex_syllables()` para usar `get_lesson_image_fields()` em vez de `**CMS_DEFAULTS`.
- [x] 1.5 Atualizar `generate_blending_words()` para usar `get_lesson_image_fields()`.
- [x] 1.6 Atualizar `generate_phrases()` e `generate_sentences()` para usar `get_lesson_image_fields()`.
- [x] 1.7 Executar seed e verificar que todas as lições (menos `review`) têm `image_url` preenchido.

## Fase 2: Backfill

- [x] 2.1 Criar `backend/app/services/backfill_lesson_images.py` com `backfill_lesson_images(db)` e `resolve_image_for_lesson(lesson_type, target)`.
- [x] 2.2 Criar ponto de entrada para execução avulsa (`python -m app.services.backfill_lesson_images`).
- [x] 2.3 Adicionar rota `POST /admin/lessons/backfill-images` em `admin_content.py`.
- [x] 2.4 Executar backfill manualmente contra o banco de desenvolvimento.
- [x] 2.5 Verificar que as lições 240 e 248 agora têm `image_url` correto.

## Fase 3: Admin UI

- [x] 3.1 Adicionar colunas `image_url` (truncado) e `image_active` (badge) na tabela do `ContentTab`.
- [x] 3.2 Adicionar campos `image_url`, `image_active`, `alt_text`, `placeholder_text` ao formulário de edição inline.
- [x] 3.3 Adicionar mesmos campos ao formulário de criação.
- [x] 3.4 Adicionar botão "Re-resolver imagens" no cabeçalho da aba.
- [x] 3.5 Adicionar método `backfillImages()` em `api.js` (`admin` namespace).

## Fase 4: Simplificação do Lesson.jsx

- [x] 4.1 Corrigir lógica de resolução de imagem: `image_url` como fonte primária, `api.images.*` como fallback quando `image_url` for null, e `image_active = false` para ocultar.
- [x] 4.2 Adicionar lógica: se `image_active === false`, mostrar `placeholder_text` em vez da imagem.
- [x] 4.3 Remover imports/funções não utilizados de `api.images` no componente.

## Fase 5: Seletor visual de emojis (EmojiPicker)

- [ ] 5.1 Criar rota `GET /admin/emoji-mappings` em `admin_content.py` que consolida `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, e `WORD_EMOJI_MAP` em resposta agrupada.
- [ ] 5.2 Criar componente `EmojiPicker.jsx` com:
  - Modal overlay com fundo semi-transparente.
  - Quatro abas: Letras, Sílabas, Palavras, Frases.
  - Grid responsivo de emojis (emoji + label).
  - Campo de busca com filtro em tempo real.
  - Botão "✕ Fechar" e clique fora para dismiss.
  - Callback `onSelect(emoji, label)` ao clicar num emoji.
- [ ] 5.3 Criar `EmojiPicker.css` com estilos do modal, grid, abas e busca.
- [ ] 5.4 Adicionar método `listEmojiMappings()` em `api.js` (`admin` namespace).
- [ ] 5.5 Integrar EmojiPicker no `Admin.jsx`:
  - Estado `showPicker` e `pickerTarget` ('edit' | 'create').
  - Botão "📂 Escolher" ao lado do campo `image_url` no formulário de edição e criação.
  - `handleEmojiSelect()` que preenche `image_url` e `alt_text`.

## Fase 6: Testes

- [x] 6.1 Testar `get_lesson_image_fields()` no seed para todos os tipos de lição.
- [x] 6.2 Testar `backfill_lesson_images()` com banco vazio e populado.
- [x] 6.3 Testar `POST /admin/lessons/backfill-images` (sucesso, erro 403 sem admin).
- [x] 6.4 Testar que `Lesson.jsx` renderiza `image_url` diretamente sem chamadas de API.
- [x] 6.5 Testar que `image_active = false` oculta a imagem.
- [ ] 6.6 Testar `GET /admin/emoji-mappings` retorna estrutura esperada.
- [ ] 6.7 Testar que EmojiPicker abre/fecha e seleciona emoji corretamente.
