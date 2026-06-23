## Why

O catálogo de emojis foi expandido de ~430 para ~555 itens, com cobertura alfabética completa (A-Z), scroll vertical, CSS corrigido e W→🌐. Agora o objetivo é levá-lo ao máximo possível do conjunto Unicode Emoji 15.0, adicionando subcategorias inteiras ainda ausentes (vestuário, calçados, esportes, setas, signos, ferramentas, etc.) para atingir ~1.185 itens no total.

## What Changes

- **Expansão máxima do catálogo** (`EMOJI_CATALOG`): adicionar ~630 novos emojis para atingir os alvos: Animais 120+, Comida 140+, Natureza 100+, Objetos 250+, Pessoas 200+, Transporte 85+, Ações 130+, Formas 160+
- **Novas subcategorias**: vestuário e calçados, bebidas, esportes, setas e símbolos, signos zodiacais, equipamentos médicos, jogos de tabuleiro, ferramentas, tecnologia, gestos de mão, partes do corpo, famílias, signos religiosos
- **Manutenção**: ordenação alfabética, scroll vertical, CSS corrigido, W→🌐, cobertura A-Z
- Nenhuma breaking change — API, schemas de resposta e componentes existentes mantêm comportamento anterior

## Capabilities

### New Capabilities
- `catalog-expansion`: Expansão do catálogo de emojis ao máximo do conjunto Unicode (~1.185 itens em 8 categorias)

### Modified Capabilities
<!-- Nenhuma — as capacidades existentes não têm requisitos alterados -->

## Impact

- **`backend/app/services/images.py`**: Adição de ~630 novos emojis ao `EMOJI_CATALOG`, com novas subcategorias (vestuário, calçados, esportes, setas, signos, ferramentas, etc.)
- **`frontend/src/components/EmojiPicker/EmojiPicker.css`**: Já corrigido (scroll vertical + variáveis CSS)
- Tamanho da resposta JSON: ~20 KB → ~45 KB
