## Context

O catálogo `EMOJI_CATALOG` em `backend/app/services/images.py` foi expandido para ~555 emojis (8 categorias), com cobertura das 26 letras e ordenação alfabética. Agora o objetivo é levá-lo ao máximo possível dentro do conjunto Unicode Emoji 15.0 (~1.200 itens úteis), incluindo todas as subcategorias disponíveis (vestuário, esportes, ferramentas, símbolos, etc.) e mantendo apenas o emoji padrão (sem variações de tom de pele ou bandeiras).

## Goals / Non-Goals

**Goals:**
- Expandir cada categoria ao máximo de emojis Unicode com nome claro em português
- Alvos: Animais 120+, Comida 140+, Natureza 100+, Objetos 250+, Pessoas 200+, Transporte 85+, Ações 130+, Formas 160+ (~1.185 total)
- Incluir subcategorias atualmente ausentes: vestuário e calçados, bebidas, esportes, setas, signos zodiacais, equipamentos médicos, jogos de tabuleiro, etc.
- Manter ordenação alfabética, scroll vertical, CSS corrigido, W→🌐
- Preservar compatibilidade total com API e componentes existentes

**Non-Goals:**
- Não incluir bandeiras de países (260+) nem variações de tom de pele (5× por emoji)
- Não incluir emojis sem nome claro em português ou muito obscuros
- Não alterar schemas de API — o formato de resposta permanece idêntico
- Não modificar os dicionários `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, `WORD_EMOJI_MAP`

## Decisions

### 1. Onde adicionar os emojis faltantes no catálogo
- **🏀 (basquete)**: Adicionar em `objects` (esportes/objetos) com nome "Basquete"
- **🌐 (globo)**: Adicionar em `objects` (tecnologia) com nome "Globo" (já existe 🌍🌎🌏 em Natureza, mas 🌐 é o globo com meridianos, mais associado a "web")
- **🪀 (ioiô)**: Adicionar em `objects` (brinquedos) com nome "Ioiô"
- **☕ (xícara)**: Adicionar entrada duplicata "Xícara" em `food` (ao lado de "Café") — emojis podem ter múltiplos nomes no catálogo

### 2. Critério de expansão máxima por categoria
- **Animais (61→120+)**: Adicionar primatas (🦍🦧🐒), ungulados (🐂🐃🐏🐑🐐🦙🦬), roedores (🦫🐿️🦔🦝), aves (🦩🦚🦜🐓🐣🐤🐥🦢🦃🪿🐦‍⬛), marinhos (🐋🦭🪸), insetos (🦂🪰🪱🦠), répteis (🐊🐍🦎), mitológicos (🐉🐲🐦‍🔥)
- **Comida (74→140+)**: Adicionar bebidas (🍵🧋🍺🍻🥂🍷🥃🍸🍹🧉🍼🥤🧃), pratos mexicanos/japoneses (🌮🌯🍱🍙🍘🥮), condimentos (🫘🫒🫑🫐🫓), cafés/chás (🧋 já), comidas diversas (🥣🥠🥡🫔)
- **Natureza (70→100+)**: Adicionar flores (🌼), cogumelos (🍄), mais paisagens, fenômenos, plantas (🪵), corpo celestes (🪐 já), estações (🌸já)
- **Objetos (71→250+)**: Adicionar vestuário completo (👕👖👗👘👙🩱🩲🩳👔), calçados (👞👟👠👡👢🥾🥿), chapéus/acessórios (👒🎩🎓🧢⛑️🪖🧣🧤🧦👛👜👝🎒🧳), móveis (🛋️🛏️🪑🪟🚪), tecnologia (📟📠☎️📃📄📑), ferramentas (🪚⛏️⚒️🛠️), equipamentos médicos (💊💉🩹🩺🩻🩸), jogos (♟️🎰🎳), música (🪘🪕🎙️🎚️🎛️🔊🔈)
- **Pessoas (91→200+)**: Adicionar gestos (🙋‍♂️🙋‍♀️🤷🤦‍♂️🤦‍♀️🙇‍♂️🙇‍♀️🤰🤱), famílias e casais (👨‍👩‍👧‍👦👩‍👩‍👧‍👦👨‍👨‍👧‍👦💑), mais profissões e papéis, crianças em atividade (🧑‍🤝‍🧑)
- **Transporte (61→85+)**: Adicionar veículos complementares (🛻🏻já), aeronaves (🪂já), infraestrutura (🅿️🚧⛽️já)
- **Ações (62→130+)**: Adicionar esportes (🏏🏑🏒🥍🏓🏸🥅⛳🎣🤿já), partes do corpo (🦵🦿🦾🦻👁️‍🗨️), gestos (🤟🤙🤘🤞🖖🤌🫶🫰🫵🫱🫲🫳🫴), atividades aquáticas/neve
- **Formas (65→160+)**: Adicionar setas (➡️⬅️⬆️⬇️↗️↘️↙️↖️↔️↕️↩️↪️⤴️⤵️🔃🔄🔙🔚🔛🔜🔝), símbolos matemáticos (0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟), astronômicos/zodiacais (♈♉♊♋♌♍♎♏♐♑♒♓⛎), pontuação (‼️⁉️❓❔❕❗), moedas (💲💱), outros (☮️✝️☪️☯️🕉️♓já)

### 3. Ordenação alfabética dos itens do catálogo
- **Decisão**: Cada lista `items` dentro de uma categoria DEVE ser ordenada alfabeticamente pelo nome em português (segundo elemento da tupla), usando `locale.strxfrm` com `pt_BR.UTF-8` para tratar corretamente acentos e cedilha (A ≠ Á ≠ Ã, C antes de Ç, etc.)
- **Alternativa considerada**: Ordenar no frontend com `Intl.Collator('pt-BR')`
- **Racional**: A ordenação no backend garante consistência para qualquer consumidor da API (admin, futuras ferramentas); evita trabalho repetido no frontend; a ordem alfabética é a esperada por educadores que buscam um item específico
- **Implementação**: Após adicionar todos os itens novos, aplicar `items.sort(key=lambda item: locale.strxfrm(item[1]))` em cada categoria. Garantir que `locale.setlocale(locale.LC_COLLATE, 'pt_BR.UTF-8')` seja chamado uma vez no módulo (com fallback para `sorted` simples se o locale não estiver instalado)

### 4. Correção do EMOJI_MAP["W"]
- **Decisão**: `"W": "🐺"` → `"W": "🌐"` no `EMOJI_MAP`
- **Racional**: A associação deve ser em português ("web"). O lobo (wolf) é uma associação em inglês, inadequada para um sistema de alfabetização em português. O emoji 🌐 (globo com meridianos) já foi adicionado ao catálogo de objetos com o nome "Globo"
- **Efeito colateral**: O seed e backfill de imagens da letra W passarão a usar 🌐. Lições existentes com 🐺 personalizado NÃO serão sobrescritas (backfill respeita `image_url` personalizado)

### 5. Scroll vertical no grid do EmojiPicker
- **Decisão**: O modal do EmojiPicker deve ter `height: 80vh` (altura fixa) em vez de apenas `max-height: 80vh`, e `min-height: 0` no flex container para permitir que o `.emoji-picker-body` encolha e ative o `overflow-y: auto`
- **Alternativa considerada**: `max-height` apenas — descartado porque o modal não ocupava altura fixa, fazendo o grid crescer sem scroll
- **Alternativa considerada**: `max-height` + `height: 80vh` no body — descartado porque o body como flex child precisa que o pai tenha `min-height: 0` para poder encolher
- **Racional**: O catálogo expandido tem categorias com 60-91 itens; o grid precisa de scroll vertical para não vazar do modal ou ocupar a tela inteira
- **Implementação**: Adicionar `height: 80vh` e `min-height: 0` ao `.emoji-picker-modal`

### 5. Correção CSS como parte da mesma mudança
- **Decisão**: Incluir a correção de 2 variáveis CSS (`--primary`→`--color-primary`, `--bg-hover`→`--color-primary-light`) nesta mudança
- **Racional**: São 2 caracteres alterados, impacto zero em outros componentes, e resolve um bug que afeta a experiência de uso do catálogo expandido

## Risks / Trade-offs

- **Tamanho do catálogo**: ~555 → ~1.185 itens. A resposta JSON cresce de ~20 KB para ~45 KB. Risco baixo — chamada admin ocasional.
- **Tempo de implementação**: Adicionar ~630 novos emojis manualmente é tedioso e propenso a erros. Mitigação: usar blocos de edição por subcategoria; a ordenação é automática pelo sort.
- **Duplicatas entre categorias**: Alguns emojis podem aparecer em mais de uma categoria (ex: 🍄 cogumelo pode ser Natureza ou Comida). Decisão: cada emoji vai na categoria mais natural; evitar duplicatas.
- **Emojis ZWJ (união)**: Emojis como 👩‍🍳 usam Zero-Width Joiner e podem não renderizar em browsers muito antigos. Mitigação: são emojis Unicode bem estabelecidos (Emoji 12.1+).
