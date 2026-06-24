## Why

O histórico de ações (feedback-list) na página de lição cresce verticalmente sem limite, acumulando até 10 itens e empurrando o VirtualKeyboard e demais elementos para baixo da tela. Isso degrada a usabilidade, especialmente em telas menores, pois o teclado virtual pode ficar parcial ou totalmente fora da viewport.

## What Changes

- Adicionar `max-height` ao `.feedback-list` para conter o crescimento vertical
- Adicionar `overflow-y: auto` para que itens excedentes sejam acessíveis via scroll
- Reduzir o limite de itens armazenados no estado de 10 para 5
- Manter o comportamento existente de exibição e feedback inalterado

## Capabilities

### New Capabilities

- `feedback-list-containment`: Contenção vertical da lista de feedbacks na página de lição, garantindo que não ultrapasse uma altura máxima definida e não empurre outros elementos do layout.

### Modified Capabilities

*(Nenhuma — a funcionalidade existente permanece inalterada, apenas o comportamento visual de contenção é adicionado.)*

## Impact

- **`frontend/src/pages/Lesson.css`**: alteração no seletor `.feedback-list` para incluir `max-height` e `overflow-y: auto`
- **`frontend/src/pages/Lesson.jsx`**: alteração no parâmetro do `Array.slice()` na função `addFeedback` (linha 69) para reduzir o limite de itens de 10 para 5
