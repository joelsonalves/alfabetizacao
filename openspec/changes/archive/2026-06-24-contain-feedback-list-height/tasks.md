## 1. CSS — Conter altura da feedback-list

- [x] 1.1 Adicionar `max-height: 140px` e `overflow-y: auto` ao seletor `.feedback-list` no arquivo `frontend/src/pages/Lesson.css`
- [x] 1.2 Adicionar `scrollbar-width: thin` ao mesmo seletor para scrollbar discreta

## 2. JavaScript — Reduzir limite de itens no estado

- [x] 2.1 Alterar `prev.slice(-9)` para `prev.slice(-4)` na linha 69 de `frontend/src/pages/Lesson.jsx`, na função `addFeedback`

## 3. Verificação

- [x] 3.1 Rodar `npm test` para garantir que nenhum teste existente quebrou
- [x] 3.2 Verificar visualmente que a feedback-list não ultrapassa 140px e o VirtualKeyboard permanece fixo
