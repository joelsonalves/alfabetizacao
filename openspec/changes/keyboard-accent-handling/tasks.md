## 1. Adicionar função de normalização em useKeyboard.js

- [x] 1.1 Adicionar função `normalizeKey(s)` no hook `useKeyboard` que aplica `.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')` — já existe em `src/utils/string.js:21` e importada em `useKeyboard.js:3`

## 2. Modificar o handleKeyDown para usar normalização

- [x] 2.1 Na comparação de caractere, substituir `key === expected` por `normalizeKey(key) === normalizeKey(expected)` — já implementado na linha 45
- [x] 2.2 Quando o match normalizado for verdadeiro, armazenar o `expected` (acentuado) em vez do `key` (sem acento) no `typedChars` — já implementado na linha 46: `setTypedChars(prev => prev + expected)`

## 3. Modificar a verificação de completude

- [x] 3.1 Na verificação de completude, normalizar ambos os lados: `normalizeKey(newTyped) === normalizeKey(target.toUpperCase())` — já implementado na linha 51

## 4. Verificar e testar

- [x] 4.1 Executar `npx vitest run` no frontend — 9/9 testes de teclado passam (35 falhas pré-existentes em HelpButton/Layout/Lesson por mock do useFeatureFlags)
- [ ] 4.2 Testar manualmente: navegar até lição com acento e digitar sem acentos — deve aceitar e completar
- [ ] 4.3 Testar manualmente: verificar que o display mostra "SOFÁ" (acentuado) e não "SOFA"
- [ ] 4.4 Testar manualmente: verificar que palavras sem acento continuam funcionando normalmente
