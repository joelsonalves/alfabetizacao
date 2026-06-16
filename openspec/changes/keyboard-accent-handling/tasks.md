## 1. Adicionar função de normalização em useKeyboard.js

- [ ] 1.1 Adicionar função `normalizeKey(s)` no hook `useKeyboard` que aplica `.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')`

## 2. Modificar o handleKeyDown para usar normalização

- [ ] 2.1 Na comparação de caractere (linha 53), substituir `key === expected` por `normalizeKey(key) === normalizeKey(expected)`
- [ ] 2.2 Quando o match normalizado for verdadeiro, armazenar o `expected` (acentuado) em vez do `key` (sem acento) no `typedChars`

## 3. Modificar a verificação de completude

- [ ] 3.1 Na verificação de completude (linha 59), normalizar ambos os lados: `normalizeKey(newTyped) === normalizeKey(target.toUpperCase())`

## 4. Verificar e testar

- [ ] 4.1 Executar `npx vitest run` no frontend para garantir que os 108 testes continuam passando
- [ ] 4.2 Testar manualmente: navegar até lesson/7/246 (ou outra lição com acento) e digitar a palavra sem acentos — deve aceitar e completar
- [ ] 4.3 Testar manualmente: verificar que o display mostra "SOFÁ" (acentuado) e não "SOFA"
- [ ] 4.4 Testar manualmente: verificar que palavras sem acento continuam funcionando normalmente
