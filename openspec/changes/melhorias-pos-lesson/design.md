## Context

O componente `Lesson.jsx` gerencia o fluxo de uma lição individual (letra, sílaba, palavra, frase). Ao final da lição, o usuário vê um resumo com pontuação e um botão "Próxima Lição". Três problemas de usabilidade foram identificados:

1. **Nav checkmark tardio**: `moduleCompletedLessons` só é atualizado em `nextLesson()` (linha 282), não quando `canComplete` se torna true
2. **Sem auto-focus**: O botão "Próxima Lição" (linha 501) não recebe foco automaticamente quando aparece
3. **TTS ao avançar**: O efeito `canComplete` (linhas 103-105) chama `speakWord(currentLesson.target)` para lições do tipo 'word', que é desnecessário ao concluir

## Goals / Non-Goals

**Goals:**
- Marcar a lição como concluída no nav menu imediatamente quando as três ações (ouvir, falar, teclar) forem realizadas
- Direcionar o foco do teclado para o botão "Próxima Lição" assim que o resultado aparecer
- Remover a chamada TTS que ocorre ao concluir a lição

**Non-Goals:**
- Não alterar a lógica de pontuação, estrelas ou progresso
- Não alterar o layout ou estilo dos componentes
- Não alterar outros fluxos (como o botão "Ouvir" ou o reconhecimento de fala)

## Decisions

### 1. Marcação imediata no nav

**Decisão**: Adicionar `setModuleCompletedLessons(prev => new Set(prev).add(currentLesson.id))` dentro do efeito `canComplete`, junto com `setLessonCompleted(true)`.

**Rationale**: O `canComplete` já detecta quando as três ações são realizadas. Adicionar a marcação ali é a abordagem mais direta e de menor impacto. O Set `moduleCompletedLessons` é usado pelo JSX do `lesson-nav` para exibir o ✅.

### 2. Auto-focus no botão "Próxima Lição"

**Decisão**: Adicionar um `useRef` para o botão e um `useEffect` que dispara `ref.current.focus()` quando `showResult` se torna true. Alternativa considerada: usar `autoFocus` no JSX — descartado porque o React nem sempre respeita `autoFocus` em elementos renderizados condicionalmente.

**Rationale**: `useRef` + `useEffect` é o padrão React para focar elementos após renderização condicional. Garante que o foco seja aplicado independentemente de como o resultado é exibido.

### 3. Remover TTS ao concluir

**Decisão**: Remover as linhas 103-105 do efeito `canComplete`:
```javascript
if (ttsSupported && currentLesson?.lesson_type === 'word') {
  speakWord(currentLesson.target)
}
```

**Rationale**: Esta fala ocorre no momento em que a lição é completada, antes mesmo do resultado aparecer. Não há motivo para falar o target da lição que acabou de ser concluída — se o usuário quer ouvir, ele usa o botão "Ouvir". A remoção é segura e não quebra nenhum fluxo.

### 4. Limpar histórico ao mudar de lição

**Decisão**: Adicionar `setFeedbacks([])` no `useEffect` de inicialização (dependência `lessonId`), junto com os outros resets de estado (linhas 145-158).

**Rationale**: O array `feedbacks` é o único estado de ação do usuário que não é limpo ao mudar de lição. Como o componente `Lesson` NÃO é desmontado/remontado pelo React Router quando apenas o parâmetro `lessonId` muda (é o mesmo componente, apenas re-renderizado), `useState([])` não reinicializa o estado — ele persiste. A limpeza explícita resolve o problema de forma simples e consistente com os demais resets.

### 5. TTS no botão de ajuda

**Decisão**: O componente `HelpButton` deve importar e usar o hook `useSpeech` diretamente. Quando o tooltip for aberto (`open` se torna `true`), chamar `speak(\`${tip.title}: ${tip.text}\`)`. Quando o tooltip for fechado, chamar `window.speechSynthesis.cancel()` para interromper a fala.

**Rationale**: Integrar TTS diretamente no `HelpButton` é mais limpo do que passar `speak` como prop do `Layout`, pois evita prop drilling e mantém o componente autossuficiente. O hook `useSpeech` já gerencia o cancelamento de utterances anteriores, então múltiplas aberturas consecutivas não acumulam fila.

## Risks / Trade-offs

- **[Marco imediato pode causar estranheza visual]** Se o nav item for marcado como concluído antes do resultado aparecer, o usuário pode achar que já pode navegar para outra lição. → Mitigação: o nav item continua clicável, mas a transição mantém o fluxo atual.
- **[Auto-focus pode conflitar com LevelUp modal]** Se `levelUp` também aparecer, o modal pode interceptar o foco. → Mitigação: o foco é aplicado no botão apenas se o LevelUp não estiver visível.
- **[Remoção do TTS é segura]** Não há dependências ou efeitos colaterais além da fala em si.
