## Why

O XP acumulado ao completar lições não é refletido no menu de navegação superior porque a atualização do `user.xp` no contexto de autenticação (`AuthContext`) só ocorre quando o jogador sobe de nível. Após uma lição que concede XP sem level-up, o score no navbar permanece congelado no valor inicial (zero ou o XP do login).

## What Changes

- **Lesson.jsx**: mover a chamada `setUser(u => u ? { ...u, level: data.level, xp: data.xp } : u)` para **fora** do bloco `if (data.level > prevLevel)`, garantindo que o `user.xp` no `AuthContext` seja atualizado sempre que uma lição é concluída, independentemente de subida de nível
- Nenhuma alteração no backend — o endpoint `POST /api/progress/lesson/{id}` já retorna `xp` e `level` corretamente em todas as respostas
- Nenhuma alteração visual — o navbar já exibe `user.xp` corretamente, apenas o dado estava desatualizado

## Capabilities

### New Capabilities

- *(Nenhuma — trata-se de correção de bug, não nova funcionalidade)*

### Modified Capabilities

- *(Nenhuma — o comportamento esperado já era o correto; a implementação continha um bug)*

## Impact

- **`frontend/src/pages/Lesson.jsx`**: mover ~3 linhas de código (linhas 110-113) — a chamada `setUser` sai de dentro do `if (data.level > prevLevel)` para depois dele
