## Why

O fluxo de conclusão de lição atualmente tem problemas de usabilidade que prejudicam a experiência do usuário:

1. O menu de navegação superior (lesson-nav) só marca a lição como concluída (✅) quando o usuário clica em "Próxima Lição", mas a lição já foi completada quando as três ações (ouvir, falar, teclar) são realizadas
2. Quando o botão "Próxima Lição" aparece, o foco não é direcionado a ele, obrigando o usuário a usar o mouse ou tabular varias vezes
3. Ao clicar em "Próxima Lição", o sistema fala a letra/palavra/frase atual via TTS, o que é desnecessário e confuso
4. Ao navegar de uma lição para outra, o histórico de feedbacks da lição anterior (feedbacks, resultados de fala) continua visível na nova lição
5. O botão de ajuda flutuante (?) não fala o conteúdo da dica via TTS, diferentemente do menu de ajuda superior que leva ao Tutorial com narração

## What Changes

1. **Marcação imediata no nav menu**: Quando `canComplete` se torna `true` (as três ações concluídas), o item da lição atual no `lesson-nav` já deve receber a marcação ✅, sem esperar o clique em "Próxima Lição"
2. **Auto-focus no botão "Próxima Lição"**: Quando o resultado da lição (`showResult`) aparece, o foco do teclado deve ser automaticamente direcionado ao botão "Próxima Lição"
3. **Remover TTS ao clicar em "Próxima Lição"**: Remover a chamada `speakWord` / `speakLetterWithWord` / `speak` que ocorre no efeito `canComplete` ou no handler `nextLesson` ao avançar para a próxima lição
4. **Limpar histórico ao mudar de lição**: Adicionar `setFeedbacks([])` no efeito de inicialização/reset executado quando `lessonId` muda, para que o histórico de feedbacks não persista entre lições
5. **TTS no botão de ajuda**: Integrar o hook `useSpeech` ao componente `HelpButton` para que, ao abrir o tooltip, o conteúdo da dica seja lido em voz alta

## Capabilities

### New Capabilities
- `lesson-nav-immediate-check`: Marcação imediata do item da lição atual no menu de navegação superior quando as três ações da lição são concluídas
- `result-auto-focus`: Foco automático no botão "Próxima Lição" quando o resultado da lição é exibido
- `silent-lesson-advance`: Remoção da fala TTS ao avançar para a próxima lição
- `lesson-history-clear`: Limpeza do histórico de feedbacks da lição ao navegar para uma nova lição
- `help-button-tts`: Leitura em voz alta do conteúdo da dica de ajuda ao abrir o tooltip do HelpButton

### Modified Capabilities
<!-- Nenhuma capability existente está sendo modificada -->

## Impact

- **Arquivos alterados**:
  - `frontend/src/pages/Lesson.jsx` — ~20 linhas alteradas (marcação imediata, auto-focus, remoção TTS, limpar feedbacks)
  - `frontend/src/components/HelpButton/HelpButton.jsx` — ~10 linhas alteradas (integrar TTS)
- **Nenhuma breaking change**: Apenas mudanças de usabilidade
- **Nenhuma nova dependência**
- **Testes existentes** (108) devem continuar passando; cenários novos para HelpButton com TTS
