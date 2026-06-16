## 1. Hook: useSpeechRecognition

- [ ] 1.1 Adicionar parâmetro `timeoutMs` (opcional, default 4000) à função `startListening`
- [ ] 1.1 Usar `timeoutMs` no lugar do `SPEECH_TIMEOUT` constante dentro de `startListening`
- [ ] 1.2 Adicionar ref `manualStopRef` inicializada como `false`
- [ ] 1.3 Modificar `stopListening` para setar `manualStopRef.current = true` antes de chamar `recognition.stop()`
- [ ] 1.4 Modificar `onend` para só chamar `onNoResult` se `!manualStopRef.current` (timeout real, não parada manual)
- [ ] 1.5 Resetar `manualStopRef.current = false` no início de `startListening`

## 2. Componente: Lesson.jsx

- [ ] 2.1 Destruturar `stopListening` do hook `useSpeechRecognition` na Lesson
- [ ] 2.2 Modificar `handleSpeech` para bifurcar: se `isListening` chama `stopListening()`, senão chama `startListening()`
- [ ] 2.3 Remover `disabled={isListening}` do botão de microfone
- [ ] 2.4 Alterar texto do botão: `🎤 Ler em voz alta...` quando `!isListening`, `🛑 Terminei de ler` quando `isListening`
- [ ] 2.5 Calcular `timeout` com base em `lesson.lesson_type`: `letter`/`consonant` → 4000, `syllable` → 6000, `word` → 8000, `sentence`/`phrase` → 20000
- [ ] 2.6 Passar `timeout` calculado como último argumento de `startListening()`

## 3. Testes: useSpeechRecognition

- [ ] 3.1 Testar que `startListening(timeoutMs)` usa o timeout customizado em vez do default
- [ ] 3.2 Testar que `stopListening()` não dispara `onNoResult` no `onend` (manual stop flag)
- [ ] 3.3 Testar que timeout default de 4000ms ainda dispara `onNoResult`

## 4. Testes: Lesson

- [ ] 4.1 Atualizar mock de `useSpeechRecognition` para expor `stopListening: vi.fn()`
- [ ] 4.2 Renderizar Lesson com `lesson_type = 'sentence'` e verificar botão exibe `🎤 Ler em voz alta...`
- [ ] 4.3 Simular clique no botão, verificar `startListening` foi chamado com timeout 20000
- [ ] 4.4 Simular `isListening = true` no mock e verificar botão exibe `🛑 Terminei de ler`
- [ ] 4.5 Simular clique em "Terminei de ler" e verificar `stopListening` foi chamado

## 5. Verificação final

- [ ] 5.1 Executar `npx vitest run` no frontend — todos os testes passando
- [ ] 5.2 Testar manualmente em http://localhost:5173/lesson/7/247 — botão alterna corretamente, timeout não corta fala
