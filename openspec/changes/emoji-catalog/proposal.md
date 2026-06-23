## Why

O seletor de emojis do admin (EmojiPicker) atualmente exibe apenas os emojis já mapeados nos dicionários (`EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, `WORD_EMOJI_MAP`), limitando a ~150 opções. Professores e administradores precisam de um catálogo completo e categorizado para associar imagens a lições de alfabetização, facilitando trocas e personalizações sem depender de dicionários pré-definidos.

## What Changes

- **Novo catálogo de emojis** no backend (~400+ emojis em 8 categorias temáticas)
- **Endpoint `GET /admin/emoji-mappings`** estendido para incluir o catálogo com indicação de quais emojis já estão mapeados
- **Aba "Catálogo" no EmojiPicker** no frontend, com sub-abas por categoria e destaque (⭐) para emojis em uso
- Nenhuma breaking change — API e componentes existentes mantêm comportamento anterior

## Capabilities

### New Capabilities
- `emoji-catalog`: Catálogo completo de emojis categorizado (animais, comida, natureza, objetos, pessoas, transporte, ações, formas/cores) com ~60+ itens por categoria, acessível via API e exibido no seletor visual do admin

### Modified Capabilities
<!-- Nenhuma — as capacidades existentes (lesson-image-storage, lesson-image-mapping) não têm requisitos alterados -->

## Impact

- **`backend/app/services/images.py`**: Adição de `EMOJI_CATALOG` (~480 linhas) + função `is_emoji_mapped()`
- **`backend/app/routes/admin_content.py`**: Extensão do schema de resposta (`CatalogItem`, `CatalogCategory`) e do endpoint `list_emoji_mappings`
- **`frontend/src/components/EmojiPicker/EmojiPicker.jsx`**: Nova aba "Catálogo" com sub-navegação por categoria
- **`frontend/src/components/EmojiPicker/EmojiPicker.css`**: Estilos para sub-abas e destaque de emojis em uso
- Nenhuma migração de banco, dependência nova ou alteração em rotas não-admin
