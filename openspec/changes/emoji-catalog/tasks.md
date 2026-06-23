## 1. Backend — Catálogo em images.py

- [x] 1.1 Adicionar `EMOJI_CATALOG` em `backend/app/services/images.py` com 8 categorias (Animais, Comida, Natureza, Objetos, Pessoas, Transporte, Ações, Formas/Cores) e ~40-60 itens cada
- [x] 1.2 Adicionar função `is_emoji_mapped(emoji: str) -> bool` que verifica se o emoji existe em `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP` ou `WORD_EMOJI_MAP`

## 2. Backend — Extensão do endpoint

- [x] 2.1 Adicionar modelos Pydantic `CatalogItem` e `CatalogCategory` em `backend/app/routes/admin_content.py`
- [x] 2.2 Adicionar campo `catalog: list[CatalogCategory]` ao `EmojiMappingsResponse`
- [x] 2.3 Estender `list_emoji_mappings` para montar o catálogo com a flag `mapped`

## 3. Frontend — Aba Catálogo no EmojiPicker

- [x] 3.1 Adicionar `{ key: 'catalog', label: 'Catálogo' }` ao array `TABS` no `EmojiPicker.jsx`
- [x] 3.2 Quando a aba "Catálogo" estiver ativa, exibir sub-abas com as categorias (ícone + nome)
- [x] 3.3 Cada sub-aba exibe grid de emojis com label curta e destaque ⭐ para `mapped: true`
- [x] 3.4 `onSelect` ao clicar num item do catálogo funciona igual às outras abas

## 4. Frontend — Estilos CSS

- [x] 4.1 Adicionar estilos para sub-abas do catálogo em `EmojiPicker.css`
- [x] 4.2 Adicionar estilo para o badge ⭐ de emoji em uso

## 5. Correção de Variáveis CSS

- [ ] 5.1 Trocar `var(--primary)` por `var(--color-primary)` em `EmojiPicker.css`
- [ ] 5.2 Trocar `var(--bg-hover)` por `var(--color-primary-light)` em `EmojiPicker.css`

## 6. Testes

- [x] 6.1 Verificar que `GET /admin/emoji-mappings` retorna campo `catalog` com 8 categorias
- [x] 6.2 Verificar que `mapped: true` aparece para emojis dos dicionários existentes
- [x] 6.3 Verificar que a aba Catálogo aparece no EmojiPicker
- [x] 6.4 Verificar que o destaque ⭐ funciona para emojis em uso
- [ ] 6.5 Verificar visualmente que sub-aba ativa tem fundo visível (contraste)
