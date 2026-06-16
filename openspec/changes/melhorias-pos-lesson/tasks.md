## 1. Marcação imediata no nav menu

- [ ] 1.1 No efeito `canComplete` em Lesson.jsx (linha 95), adicionar `setModuleCompletedLessons(prev => new Set(prev).add(currentLesson.id))` junto com `setLessonCompleted(true)` (linha 97)

## 2. Auto-focus no botão "Próxima Lição"

- [ ] 2.1 Adicionar `useRef` para o botão "Próxima Lição" no componente
- [ ] 2.2 Adicionar `ref` ao elemento `<button className="btn btn-primary">` na linha 501
- [ ] 2.3 Adicionar `useEffect` que chama `ref.current.focus()` quando `showResult` se torna true e `levelUp` é nulo

## 3. Remover TTS ao concluir lição

- [ ] 3.1 Remover as linhas 103-105 do efeito `canComplete` em Lesson.jsx:
  ```javascript
  if (ttsSupported && currentLesson?.lesson_type === 'word') {
    speakWord(currentLesson.target)
  }
  ```

## 4. Limpar histórico ao mudar de lição

- [ ] 4.1 Adicionar `setFeedbacks([])` no `useEffect` de inicialização em Lesson.jsx (junto com os demais resets, ao redor da linha 145)

## 5. TTS no botão de ajuda flutuante

- [ ] 5.1 Em `HelpButton.jsx`, importar `useSpeech` de `../../hooks/useSpeech`
- [ ] 5.2 Desestruturar `speak` e `supported` do hook
- [ ] 5.3 Adicionar `useEffect` que, quando `open` se torna `true` e `supported` é true, chama `speak(\`${tip.title}: ${tip.text}\`)`
- [ ] 5.4 No mesmo `useEffect`, quando `open` se torna `false`, chamar `window.speechSynthesis.cancel()` (ou deixar o `speak` cancelar automaticamente na próxima chamada)
- [ ] 5.5 Adicionar `speak` e `supported` ao `useEffect` já existente (linha 35-42) que gerencia a tecla Escape, ou criar um separado

## 6. Verificar e testar

- [ ] 6.1 Executar `npx vitest run` no frontend para garantir que os testes continuam passando
- [ ] 6.2 Testar manualmente: completar uma lição e verificar que o ✅ aparece no nav antes de clicar "Próxima Lição"
- [ ] 6.3 Testar manualmente: verificar que o foco vai para "Próxima Lição" ao aparecer o resultado
- [ ] 6.4 Testar manualmente: verificar que nenhum som é reproduzido ao clicar "Próxima Lição"
- [ ] 6.5 Testar manualmente: navegar de uma lição para outra e confirmar que feedbacks antigos não aparecem
- [ ] 6.6 Testar manualmente: abrir o help button e verificar que o conteúdo da dica é lido em voz alta
