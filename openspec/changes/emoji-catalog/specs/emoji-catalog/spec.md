## ADDED Requirements

### Requirement: Catálogo de emojis no backend

O backend DEVE disponibilizar um catálogo curado de emojis organizado em categorias temáticas, servido via `GET /admin/emoji-mappings` no campo `catalog`.

O catálogo DEVE conter no mínimo 400 emojis distribuídos em 8 categorias:
- Animais
- Comida
- Natureza
- Objetos
- Pessoas
- Transporte
- Ações
- Formas e Cores

Cada categoria DEVE ter no mínimo 40 itens.

Cada item do catálogo DEVE conter:
- `emoji`: o caractere Unicode do emoji
- `label`: nome curto em português (ex: "Cachorro", "Maçã")
- `mapped`: booleano indicando se o emoji já existe em qualquer um dos dicionários (`EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, `WORD_EMOJI_MAP`)

#### Scenario: Catálogo é servido no endpoint de mapeamentos

- **WHEN** um admin autenticado faz GET em `/api/admin/emoji-mappings`
- **THEN** a resposta DEVE conter um campo `catalog` com 8 categorias
- **AND** cada categoria DEVE conter `key`, `name`, `icon`, `items`

#### Scenario: Flag mapped reflete emojis em uso

- **WHEN** o backend monta a resposta do catálogo
- **AND** um emoji do catálogo existe em `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP` ou `WORD_EMOJI_MAP`
- **THEN** `mapped` DEVE ser `true` para aquele item
- **AND** `mapped` DEVE ser `false` caso contrário

#### Scenario: Catálogo requer autenticação admin

- **WHEN** um usuário não autenticado faz GET em `/api/admin/emoji-mappings`
- **THEN** a resposta DEVE ser `401 Unauthorized`

---

### Requirement: Aba "Catálogo" no EmojiPicker

O componente EmojiPicker DEVE exibir uma aba "Catálogo" ao lado das abas existentes (Letras, Sílabas, Palavras, Frases).

Ao selecionar a aba "Catálogo", o picker DEVE exibir sub-abas para cada categoria do catálogo.

Cada sub-aba DEVE exibir um grid de emojis com label curta.

Emojis com `mapped: true` DEVEM receber um indicador visual (⭐) no canto superior direito.

Ao clicar em um emoji do catálogo, o comportamento DEVE ser idêntico ao das outras abas: `onSelect(emoji, label)` é chamado, preenchendo `image_url` e `alt_text`.

#### Scenario: Aba Catálogo aparece no picker

- **WHEN** um admin abre o EmojiPicker
- **THEN** as abas DEVEM incluir "Catálogo" como quinta aba

#### Scenario: Sub-abas exibem categorias

- **WHEN** o admin clica na aba "Catálogo"
- **THEN** sub-abas são exibidas com os nomes das categorias (Animais, Comida, etc.)
- **AND** o ícone representativo de cada categoria é mostrado ao lado do nome

#### Scenario: Emoji em uso é destacado

- **WHEN** o admin navega para uma categoria do catálogo
- **AND** um emoji na grade tem `mapped: true`
- **THEN** um ⭐ DEVE aparecer no canto superior direito do item

#### Scenario: Seleção de emoji do catálogo

- **WHEN** o admin clica em um emoji na aba Catálogo
- **THEN** `onSelect(emoji, label)` é chamado
- **AND** o campo `image_url` é preenchido com o emoji
- **AND** o campo `alt_text` é preenchido com o label

---

### Requirement: Busca abrange todas as abas

O campo de busca no EmojiPicker DEVE filtrar os itens da aba ativa, incluindo a aba Catálogo e suas sub-abas.

#### Scenario: Busca no catálogo

- **WHEN** o admin está na aba Catálogo > Animais
- **AND** digita "gato" no campo de busca
- **THEN** apenas itens contendo "gato" (label ou key) DEVEM ser exibidos

#### Scenario: Busca sem resultados no catálogo

- **WHEN** o admin está na aba Catálogo
- **AND** digita um termo sem correspondência
- **THEN** a mensagem "Nenhum emoji encontrado" DEVE ser exibida

---

### Requirement: Variáveis CSS do catálogo usam nomes corretos do tema

Os estilos CSS do EmojiPicker DEVEM usar as variáveis definidas em `theme.css`.

O tema define `--color-primary` (#2D7A79), não `--primary`. O tema define `--color-primary-light` (#4A9E9D) para hover, não `--bg-hover`.

#### Scenario: Aba de categoria ativa tem fundo visível

- **WHEN** o admin clica na aba Catálogo
- **AND** clica em uma categoria (ex: Animais)
- **THEN** a sub-aba ativa DEVE ter `background: var(--color-primary)` e `color: #fff`
- **AND** o texto da sub-aba DEVE ser legível (não branco no branco)

#### Scenario: Hover em sub-aba usa cor primária clara

- **WHEN** o admin passa o mouse sobre uma sub-aba de categoria
- **THEN** o fundo DEVE usar `var(--color-primary-light)`
