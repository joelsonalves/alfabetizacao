## Why

Palavras acentuadas em lições de frases e sentenças (ex: "SOFÁ", "SÃO", "É", "PÔS") são impossíveis de digitar porque o teclado físico e o virtual produzem apenas caracteres sem acento (ex: "A", "E", "O"), enquanto o matching no hook `useKeyboard` faz comparação direta (`===`) entre a tecla pressionada e o caractere esperado. O usuário fica preso na lição sem conseguir avançar.

## What Changes

- **Normalizar acentos no matching do teclado**: No hook `useKeyboard`, aplicar NFD normalization + remoção de diacríticos (mesma lógica do `normalize()` usado no reconhecimento de fala) tanto na tecla pressionada quanto no caractere esperado antes de comparar
- **Preservar acentos no display**: Quando o usuário digitar a letra base correta (ex: "A" para "Á"), o sistema deve aceitar como correto e armazenar o caractere acentuado esperado no `typedChars`, preservando a exibição visual correta
- **Nenhuma alteração no banco de dados**: Palavras acentuadas permanecem como estão nas frases e sentenças

## Capabilities

### New Capabilities
- `keyboard-accent-normalization`: Normalização de acentos na comparação entre tecla pressionada e caractere esperado no hook `useKeyboard`, permitindo que letras acentuadas sejam digitadas sem o acento

### Modified Capabilities
<!-- Nenhuma capability existente está sendo modificada -->

## Impact

- **Arquivo alterado**: `frontend/src/hooks/useKeyboard.js` — ~10 linhas alteradas (função de normalização + uso no handleKeyDown + completion check)
- **Nenhuma alteração no banco de dados**
- **Nenhuma breaking change**: O comportamento para caracteres sem acento permanece idêntico
- **Testes existentes** (108) devem continuar passando; novos testes para acentos podem ser adicionados
