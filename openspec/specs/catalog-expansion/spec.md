# catalog-expansion Specification

## Purpose
TBD - created by archiving change catalog-expansion. Update Purpose after archive.
## Requirements
### Requirement: EMOJI_MAP["W"] associado a 🌐 (web)
A letra W no `EMOJI_MAP` DEVE ser mapeada para o emoji `🌐` (globo/web) em vez de `🐺` (lobo), pois a associação deve ser em português ("web").

#### Scenario: W aponta para globo
- **WHEN** o `EMOJI_MAP` é consultado para a chave "W"
- **THEN** o valor DEVE ser `"🌐"` (globo/web)

### Requirement: Catálogo cobre todas as letras do alfabeto
O catálogo `EMOJI_CATALOG` DEVE conter ao menos um item cujo nome em português comece com cada letra de A a Z.

#### Scenario: Letra B tem representante
- **WHEN** um admin abre o catálogo e busca por "Basquete" ou "🏀"
- **THEN** o item (🏀, "Basquete") DEVE estar presente na categoria `objects`

#### Scenario: Letra W tem representante
- **WHEN** um admin abre o catálogo e busca por "Globo" ou "🌐"
- **THEN** o item (🌐, "Globo") DEVE estar presente na categoria `objects`

#### Scenario: Letra X tem representante explícito
- **WHEN** um admin abre o catálogo e busca por "Xícara" ou "☕"
- **THEN** o item (☕, "Xícara") DEVE estar presente na categoria `food`
- **AND** o item (☕, "Café") DEVE continuar existindo na categoria `food`

#### Scenario: Letra Y tem representante
- **WHEN** um admin abre o catálogo e busca por "Ioiô" ou "🪀"
- **THEN** o item (🪀, "Ioiô") DEVE estar presente na categoria `objects`

### Requirement: Catálogo expandido ao máximo possível
O `EMOJI_CATALOG` DEVE incluir todos os emojis Unicode comuns (até Emoji 15.0) que tenham nome claro em português, excluindo apenas bandeiras de países, variações de tom de pele (manter apenas o padrão), e símbolos muito obscuros. Cada categoria DEVE atingir os seguintes alvos mínimos:

| Categoria | Alvo mínimo | Principais subcategorias a adicionar |
|-----------|-------------|-------------------------------------|
| Animais | 120 | Primatas, ungulados, roedores, aves, insetos, marinhos, répteis, mitológicos |
| Comida | 140 | Bebidas, comidas mexicanas/japonesas/indianas, cereais, condimentos |
| Natureza | 100 | Fenômenos, paisagens, plantas, flores, corpos celestes |
| Objetos | 250 | Roupas/calçados, móveis, tecnologia, instrumentos musicais, materiais escolares, utensílios domésticos, equipamentos médicos, jogos |
| Pessoas | 200 | Gestos, famílias, casais, mais profissões, papéis, atividades |
| Transporte | 85 | Veículos complementares, sinalização, infraestrutura |
| Ações | 130 | Esportes, partes do corpo, gestos, atividades aquáticas/neve |
| Formas | 160 | Setas, símbolos matemáticos, astronômicos, geométricos, zodiacais |

#### Scenario: Animais atinge 120+ itens
- **WHEN** o backend carrega o `EMOJI_CATALOG`
- **THEN** `len(catalog["animals"]["items"]) >= 120`
- **AND** DEVE incluir primatas (🦍🦧), aves (🦩🦚🦜🐓🐣), insetos (🦂🪰), marinhos (🦭🐋), répteis (🐊🐍), mitológicos (🐉)

#### Scenario: Comida atinge 140+ itens
- **WHEN** o backend carrega o `EMOJI_CATALOG`
- **THEN** `len(catalog["food"]["items"]) >= 140`
- **AND** DEVE incluir bebidas (🍵🧋🍺🍷🥂🥃🍸🍹🧉🍼), pratos (🌮🌯🍱🍙🥮), condimentos (🫘🫒🫑)

#### Scenario: Natureza atinge 100+ itens
- **WHEN** o backend carrega o `EMOJI_CATALOG`
- **THEN** `len(catalog["nature"]["items"]) >= 100`
- **AND** DEVE incluir mais flores (🌼), cogumelos (🍄), paisagens, fenômenos

#### Scenario: Objetos atinge 250+ itens
- **WHEN** o backend carrega o `EMOJI_CATALOG`
- **THEN** `len(catalog["objects"]["items"]) >= 250`
- **AND** DEVE incluir roupas (👕👖👗👘👙🩱🩲🩳), calçados (👞👟👠👡👢), chapéus (👒🎩🎓🧢⛑️🪖), acessórios (🧣🧤🧦👛👜🎒🧳), móveis (🛋️🛏️), equipamentos médicos (💊💉🩹🩺🩻), tecnologia (📟📠☎️), ferramentas (🪚)

#### Scenario: Pessoas atinge 200+ itens
- **WHEN** o backend carrega o `EMOJI_CATALOG`
- **THEN** `len(catalog["people"]["items"]) >= 200`
- **AND** DEVE incluir gestos (🙋‍♂️🙋‍♀️🤷🤦🙇‍♂️🙇‍♀️), famílias (👨‍👩‍👧‍👦), mais profissões, papéis

#### Scenario: Transporte atinge 85+ itens
- **WHEN** o backend carrega o `EMOJI_CATALOG`
- **THEN** `len(catalog["transport"]["items"]) >= 85`

#### Scenario: Ações atinge 130+ itens
- **WHEN** o backend carrega o `EMOJI_CATALOG`
- **THEN** `len(catalog["actions"]["items"]) >= 130`
- **AND** DEVE incluir esportes (🏏🏑🏒🥍🏓🏸), partes do corpo (🦵🦿🦾), gestos (🤟🤙🤘🤞🖖🤌)

#### Scenario: Formas atinge 160+ itens
- **WHEN** o backend carrega o `EMOJI_CATALOG`
- **THEN** `len(catalog["shapes"]["items"]) >= 160`
- **AND** DEVE incluir setas (➡️⬅️⬆️⬇️↗️↘️↙️↖️↔️↕️), símbolos matemáticos/astronômicos (♈♉♊♋♌♍♎♏♐♑♒♓⛎)

### Requirement: Itens ordenados alfabeticamente por nome em português
Os itens de cada categoria do `EMOJI_CATALOG` DEVEM estar ordenados em ordem alfabética crescente pelo nome em português (segundo elemento da tupla), respeitando acentos e caracteres especiais.

#### Scenario: Animais está ordenado alfabeticamente
- **WHEN** a lista de itens da categoria `animals` é inspecionada
- **THEN** os nomes DEVEM estar em ordem crescente começando por "Abelha", "Águia" e terminando com "Vaca" (ou similar, dependendo dos itens presentes)

#### Scenario: Comida está ordenado alfabeticamente
- **WHEN** a lista de itens da categoria `food` é inspecionada
- **THEN** os nomes DEVEM estar em ordem crescente, com "Abacate" antes de "Abacaxi", e "Alface" antes de "Alho"

#### Scenario: Todas as categorias seguem o mesmo critério
- **WHEN** cada categoria do catálogo é verificada
- **THEN** `items == sorted(items, key=lambda x: locale.strxfrm(x[1]))` para todas as 8 categorias

### Requirement: EmojiPicker com scroll vertical no grid de imagens
O modal do EmojiPicker DEVE ocupar altura fixa de 80vh da janela, com a área de grid de imagens rolável verticalmente quando o conteúdo exceder o espaço disponível.

#### Scenario: Modal tem altura fixa de 80vh
- **WHEN** o EmojiPicker é aberto
- **THEN** o modal DEVE ter `height: 80vh` (altura fixa, não `max-height` apenas)

#### Scenario: Grid de imagens rola verticalmente
- **WHEN** a categoria selecionada tem mais itens do que cabem na área visível (ex: Pessoas com 91 itens)
- **THEN** o `.emoji-picker-body` DEVE exibir scroll vertical (`overflow-y: auto`)
- **AND** o modal NÃO DEVE ultrapassar 80vh de altura

#### Scenario: Flex children encolhem corretamente
- **WHEN** o modal é renderizado com `display: flex; flex-direction: column`
- **THEN** o `.emoji-picker-modal` DEVE ter `min-height: 0` para permitir que os filhos encolham abaixo do tamanho do conteúdo

### Requirement: Sub-aba ativa do EmojiPicker visível
O seletor de sub-aba (categoria) no EmojiPicker DEVE ter estilo visual distinto quando ativo, usando variáveis CSS válidas do tema.

#### Scenario: Sub-aba ativa tem fundo colorido visível
- **WHEN** um admin clica em uma sub-aba (ex: "Animais") na aba "Catálogo"
- **THEN** a sub-aba ativa DEVE ter `background-color: var(--color-primary-light)` (não `var(--bg-hover)`)
- **AND** o texto da sub-aba ativa DEVE ter `color: var(--color-primary)` (não `var(--primary)`)

