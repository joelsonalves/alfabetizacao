## Why

O link "❓ Ajuda" na barra de navegação superior aponta para `/tutorial`, mas não verifica a feature flag `feature_tutorial`. Quando o admin desativa esta flag, a página Tutorial redireciona para `/dashboard`, mas o link na navbar continua visível — experiência confusa para o usuário, que vê um link que leva a um redirecionamento.

## What Changes

- **Navbar (`Layout.jsx`)**: o link "❓ Ajuda" será renderizado condicionalmente, apenas quando `feature_tutorial` estiver ativa
- Nenhuma mudança no backend, API ou nas flags existentes

## Capabilities

### New Capabilities

Nenhuma. O comportamento é inteiramente uma modificação no frontend existente.

### Modified Capabilities

- `feature-flags-frontend`: adicionar requirement de que o link "Ajuda" na navbar respeite `feature_tutorial`, com cenários de flag ativa/inativa
- `feature-flags-backend`: sem alterações

## Impact

- **Apenas**: `frontend/src/components/Layout/Layout.jsx`
- Nenhuma alteração em APIs, schemas, banco de dados ou backend
