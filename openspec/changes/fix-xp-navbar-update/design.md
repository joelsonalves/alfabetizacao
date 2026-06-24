## Context

O navbar exibe `user.xp` do `AuthContext`. Ao completar uma lição, o frontend envia o progresso para `POST /api/progress/lesson/{id}`, que retorna `{ status, xp, level }`. O `AuthContext` só é atualizado (via `setUser`) quando `data.level > prevLevel` (subida de nível), ignorando o XP retornado nas demais conclusões.

## Goals / Non-Goals

**Goals:**
- O `user.xp` no `AuthContext` deve refletir o XP total retornado pelo backend após **toda** lição concluída
- Código existente de `setLevelUp` (modal de subida de nível) deve continuar funcionando

**Non-Goals:**
- Nenhuma alteração no backend (já retorna dados corretos)
- Nenhuma alteração no navbar (já lê `user.xp` corretamente)
- Nenhuma persistência extra em `localStorage` (o `api.auth.me()` já carrega do backend ao recarregar a página)

## Decisions

| Decisão | Alternativa | Motivo |
|---------|-------------|--------|
| Mover `setUser` para fora do `if (data.level > prevLevel)` | Duplicar `setUser` nos dois braços do `if` | Manter uma única chamada evita duplicação e garante que XP e level sejam sempre atualizados em conjunto |
| Atualizar `localStorage` também | Apenas atualizar estado React | O estado React é a fonte da verdade para o navbar; `localStorage` é apenas um cache de inicialização que será sobrescrito por `api.auth.me()` no próximo refresh |

## Risks / Trade-offs

- **[Mínimo]** Se `data.xp` ou `data.level` estiverem ausentes na resposta (`undefined`), o `setUser` propagará `undefined` para esses campos → *Mitigação*: o operador `?.` (optional chaining) já está presente nos ternários, e o backend sempre retorna ambos os campos.
