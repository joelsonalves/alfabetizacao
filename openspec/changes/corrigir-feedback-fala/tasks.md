## 1. Criar função extractSpokenContent em Lesson.jsx

- [x] 1.1 Definir `extractSpokenContent(transcript, target, sounds)` como arrow function junto a `tryExtractTarget`
- [x] 1.2 Implementar lógica de prefix stripping: percorrer `SPEECH_PREFIXES`, remover prefixo e aplicar `.trim()` no resultado
- [x] 1.3 Implementar fallback de extração: se match falhar, retornar a palavra mais curta do transcript como `content`
- [x] 1.4 Retornar objeto `{ content: string, isCorrect: boolean }` — usar a lógica de `tryExtractTarget` para determinar `isCorrect` e a extração para determinar `content`

## 2. Corrigir prefix stripping em tryExtractTarget

- [x] 2.1 Adicionar `.trim()` no resultado do `replace` na linha 204 de Lesson.jsx: `const stripped = normalized.replace(normalize(prefix), '').trim()`

## 3. Substituir uso de transcript bruto pelo conteúdo extraído

- [x] 3.1 Em `handleSpeech` (linha 236), substituir `tryExtractTarget` por `extractSpokenContent(transcript, target, acceptedSounds)` e desestruturar `{ content, isCorrect }`
- [x] 3.2 Substituir as ocorrências de `${transcript}` no `addFeedback` por `${content}` (linhas 243, 248)
- [x] 3.3 Atualizar o JSX de exibição `speechResult` (linha 448) para usar o `content` extraído em vez do `speechResult` bruto no feedback visual "Você disse: {content}"

## 4. Sincronizar estado speechResult com content extraído

- [x] 4.1 Alterar `setSpeechResult(transcript)` na linha 222 para `setSpeechResult(content)` — ou criar estado separado `speechContent` — de modo que o feedback visual reflita o conteúdo extraído e não o transcript bruto

## 6. Corrigir TTS para usar mensagens estruturadas com displayTarget

- [x] 6.1 Substituir `speak(\`Você falou ${content}. Parabéns!\`)` por `speak(\`Muito bem! Você acertou a letra ${displayTarget}.\`)` (linha 257) — já implementado
- [x] 6.2 Substituir `speak(\`Você falou ${content}. Vamos tentar novamente!\`)` por `speak(\`Quase! Tente novamente. A letra é ${displayTarget}.\`)` (linha 262) — já implementado

## 5. Verificar e testar

- [ ] 5.1 Executar `docker compose up -d --force-recreate --remove-orphans` para reiniciar containers
- [ ] 5.2 Testar manualmente o fluxo de fala no navegador: falar "LETRA B" e confirmar que feedback exibe "B" e não "LETRA BAIRRO"
- [x] 5.3 Executar `npx vitest run` no frontend para garantir que os 108 testes existentes continuam passando
- [x] 5.4 Verificar que o estado `speechResult` não quebra a exibição no JSX (linhas 446-456) — 108/108 testes passam, incluindo `Lesson.test.jsx` (7 testes)
