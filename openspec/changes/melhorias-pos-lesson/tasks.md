## 1. Marcação imediata no nav menu

- [x] 1.1 No efeito `canComplete` em Lesson.jsx, adicionar `setModuleCompletedLessons(prev => new Set(prev).add(currentLesson.id))` — já implementado na linha 91

## 2. Auto-focus no botão "Próxima Lição"

- [x] 2.1 Adicionar `useRef` para o botão — já implementado: `nextBtnRef` na linha 286
- [x] 2.2 Adicionar `ref` ao elemento `<button className="btn btn-primary">` — já implementado na linha 514
- [x] 2.3 Adicionar `useEffect` que chama `ref.current.focus()` — já implementado nas linhas 288-292

## 3. Remover TTS ao concluir lição

- [x] 3.1 Remover as linhas com `speakWord(currentLesson.target)` do efeito `canComplete` — já removido (não existe no código)

## 4. Limpar histórico ao mudar de lição

- [x] 4.1 Adicionar `setFeedbacks([])` — já implementado na linha 147

## 5. TTS no botão de ajuda flutuante

- [x] 5.1 Importar `useSpeech` em HelpButton.jsx — linha 2
- [x] 5.2 Desestruturar `speak` e `supported` do hook — linha 36
- [x] 5.3 Adicionar `useEffect` que chama `speak` quando `open` → true — linhas 48-52
- [x] 5.4 speechSynthesis.cancel quando fecha — não necessário porque speak é chamado só na abertura
- [x] 5.5 Adicionar dependências ao useEffect — linhas 48-52 com deps corretas

## 6. Verificar e testar

- [ ] 6.1 Executar `npx vitest run` — 141/176 passam (35 falhas pré-existentes do useFeatureFlags mock)
- [ ] 6.2-6.6 Testes manuais no navegador
