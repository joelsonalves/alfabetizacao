## 1. Correção no Lesson.jsx

- [x] 1.1 Mover a chamada `setUser(u => u ? { ...u, level: data.level, xp: data.xp } : u)` para fora do bloco `if (data.level > prevLevel)`, posicionando-a imediatamente após o fechamento do `if`

## 2. Verificação de testes

- [x] 2.1 Verificar se `Lesson.test.jsx` testa o comportamento de `setUser`; se sim, atualizar o teste para garantir que `setUser` seja chamado em toda conclusão de lição (não apenas em level up) — testes existentes não fazem asserção direta sobre `setUser`; comportamento de level up permanece inalterado, nenhuma alteração necessária
- [x] 2.2 Executar `npm test` no diretório `frontend/` para confirmar que nenhum teste existente quebrou — 14 falhas em Lesson são pré-existentes (mock ausente de `useFeatureFlags`), nenhuma introduzida por esta alteração
