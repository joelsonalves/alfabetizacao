## Context

O componente `Layout.jsx` renderiza a barra de navegação superior com links fixos, incluindo "❓ Ajuda" que aponta para `/tutorial`. A página Tutorial já verifica `feature_tutorial` e redireciona se inativa, mas o link na navbar permanece visível — incoerência de UX.

O `FeatureFlagsContext` já está disponível via hook `useFeatureFlags()` e é consumido por outros componentes (HelpButton, Lesson, Tutorial). O `Layout.jsx` atualmente não o utiliza.

## Goals / Non-Goals

**Goals:**
- Ocultar o link "❓ Ajuda" da navbar quando `feature_tutorial` estiver inativa
- Manter link visível quando `feature_tutorial` estiver ativa

**Non-Goals:**
- Não alterar os demais links da navbar (Início, Perfil, Admin)
- Não criar novas feature flags
- Não alterar o backend ou API

## Decisions

| Decisão | Opção escolhida | Alternativa | Motivo |
|---------|----------------|-------------|--------|
| Onde verificar a flag | `Layout.jsx` (JSX condicional) | CSS `display:none` | Remover do DOM evita tabs falsas e é consistente com o padrão usado em HelpButton |
| Hook a usar | `useFeatureFlags()` → `isActive()` | `getBehavior()` | `isActive()` retorna boolean simples; `getBehavior()` é para flags com `behavior_on_inactive` configurável |
| Flag a verificar | `feature_tutorial` | Nova flag `feature_nav_tutorial` | Reutilizar flag existente evita proliferação de flags e mantém semântica: tutorial desativado → link oculto |

## Risks / Trade-offs

- **[Consistência]**: Se no futuro houver outras páginas com link na navbar e flag própria, cada uma precisará da mesma verificação manual. Pode valer um componente `<NavLink>` genérico com prop `flagKey` futuramente.
- **[Cache]**: O `FeatureFlagsContext` já busca as flags via API e as cacheia. Não há risco de frescura pois a página recarrega ao navegar.
