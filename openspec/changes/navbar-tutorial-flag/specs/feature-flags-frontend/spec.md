# Feature Flags — Navbar "Ajuda" Link

## MODIFIED Requirements

### Requirement: Tutorial page checks feature flag

A página Tutorial DEVE verificar `isActive('feature_tutorial')`. Se a flag não estiver ativa, DEVE redirecionar para `/dashboard`.

Como consequência, o link "❓ Ajuda" na navbar (`Layout.jsx`) que aponta para `/tutorial` TAMBÉM DEVE ser ocultado quando `feature_tutorial` está inativa, para evitar experiência confusa (link visível que leva a redirecionamento).

#### Scenario: Tutorial blocked when flag is off
- **GIVEN** `feature_tutorial` tem `active: false`
- **WHEN** o usuário navega para `/tutorial`
- **THEN** o usuário DEVE ser redirecionado para `/dashboard`
- **AND** o link "❓ Ajuda" na navbar NÃO DEVE estar visível

#### Scenario: Tutorial loads when flag is on
- **GIVEN** `feature_tutorial` tem `active: true`
- **WHEN** o usuário navega para `/tutorial`
- **THEN** o tutorial DEVE carregar normalmente
- **AND** o link "❓ Ajuda" na navbar DEVE estar visível

## ADDED Requirements

### Requirement: Navbar link "Ajuda" respeita feature_tutorial flag

O link "❓ Ajuda" na barra de navegação superior (`Layout.jsx`) DEVE consultar `isActive('feature_tutorial')` do `FeatureFlagsContext`. Se a flag não estiver ativa, o link NÃO DEVE ser renderizado no `<nav>`.

Isso é necessário porque o link leva a `/tutorial`, e a própria página Tutorial já redireciona para `/dashboard` quando `feature_tutorial` está inativa. Manter o link visível mas levando a uma página que redireciona é uma experiência de usuário confusa.

#### Scenario: Navbar hide Ajuda when tutorial is disabled
- **GIVEN** `feature_tutorial` tem `active: false`
- **WHEN** o usuário está autenticado e vê a barra de navegação
- **THEN** o link "❓ Ajuda" NÃO DEVE aparecer no `<nav>`

#### Scenario: Navbar show Ajuda when tutorial is enabled
- **GIVEN** `feature_tutorial` tem `active: true`
- **WHEN** o usuário está autenticado e vê a barra de navegação
- **THEN** o link "❓ Ajuda" DEVE aparecer no `<nav>`

### Requirement: Demais links da navbar permanecem inalterados

Os links "🏠 Início", "👤 Perfil" e "⚙️ Admin" (quando `user.is_admin`) NÃO DEVEM ser afetados por feature flags. Apenas o link "❓ Ajuda" DEVE ser condicional à `feature_tutorial`.

#### Scenario: Other nav links always visible
- **GIVEN** `feature_tutorial` tem `active: false`
- **WHEN** o usuário está autenticado e vê a barra de navegação
- **THEN** os links "🏠 Início" e "👤 Perfil" DEVEM permanecer visíveis
