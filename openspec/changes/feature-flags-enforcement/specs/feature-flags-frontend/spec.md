# Feature Flags — Enforcement Frontend

## MODIFIED Requirements

### Requirement: HelpButton checks feature flag

O componente `HelpButton` DEVE consultar `isActive('feature_help_button')` do `FeatureFlagsContext`. Se a flag não estiver ativa, DEVE renderizar `null`.

#### Scenario: HelpButton hidden when flag is off
- **GIVEN** a usuário autenticado
- **WHEN** `feature_help_button` tem `active: false`
- **THEN** `HelpButton` NÃO DEVE renderizar nada no DOM

#### Scenario: HelpButton visible when flag is on
- **GIVEN** a usuário autenticado
- **WHEN** `feature_help_button` tem `active: true`
- **THEN** `HelpButton` DEVE renderizar normalmente

### Requirement: LevelUp checks feature flag

O componente `LevelUp` DEVE consultar `isActive('feature_level_up')` do `FeatureFlagsContext`. Se a flag não estiver ativa, NÃO DEVE renderizar, mesmo quando acionado pela conclusão de lição.

#### Scenario: LevelUp suppressed when flag is off
- **GIVEN** `feature_level_up` tem `active: false`
- **WHEN** o aluno completa uma lição
- **THEN** o modal LevelUp NÃO DEVE aparecer

#### Scenario: LevelUp appears when flag is on
- **GIVEN** `feature_level_up` tem `active: true`
- **WHEN** o aluno completa uma lição com level up
- **THEN** o modal LevelUp DEVE aparecer normalmente

### Requirement: Tutorial page checks feature flag

A página Tutorial DEVE verificar `isActive('feature_tutorial')`. Se a flag não estiver ativa, DEVE redirecionar para `/dashboard`.

Como consequência, o link "❓ Ajuda" na navbar (`Layout.jsx`) que aponta para `/tutorial` TAMBÉM DEVE ser ocultado quando `feature_tutorial` está inativa (ver requirement específico abaixo).

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

### Requirement: Lesson page trata erro 403 de módulo desativado

O componente `Lesson.jsx` DEVE tratar o erro HTTP 403 da API (`GET /lessons/{lesson_id}`) como indicativo de módulo desativado. Quando receber 403, DEVE:

1. Renderizar uma tela com:
   - Ícone 🔒
   - Título "Módulo Indisponível"
   - Texto "Este módulo foi desativado pelo administrador."
   - Botão "Ir para o Dashboard"
2. O botão DEVE navegar para `/dashboard`
3. Erros 404 (lição não encontrada) DEVEM continuar mostrando a mensagem genérica "Lição não encontrada"

#### Scenario: Lesson page shows specific message for disabled module
- **GIVEN** uma lição de módulo que foi desativado pelo admin
- **WHEN** o usuário navega para `/lesson/{module_id}/{lesson_id}`
- **THEN** a API retorna **403** com `detail="Module is disabled by administrator"`
- **AND** o frontend captura o erro 403 no `Promise.all().catch()`
- **AND** o frontend exibe tela com 🔒, "Módulo Indisponível" e "Este módulo foi desativado pelo administrador."
- **AND** o frontend mostra botão "Ir para o Dashboard"

#### Scenario: Lesson page continues showing generic 404
- **GIVEN** uma URL de lição que não existe (ex: `/lesson/999/99999`)
- **WHEN** o usuário navega para essa URL
- **THEN** a API retorna 404
- **AND** o frontend exibe "Lição não encontrada" (comportamento inalterado)

### Requirement: Error 403 não quebra o carregamento da página

O tratamento do erro 403 DEVE ser feito dentro do `.catch()` da Promise, evitando que a exceção não tratada deixe a página em estado de "Carregando..." infinito.

#### Scenario: Loading state is properly resolved on 403
- **GIVEN** um módulo desativado
- **WHEN** o usuário navega para uma lição desse módulo
- **THEN** `loading` DEVE ser setado para `false` no `.finally()`
- **AND** a tela de módulo indisponível DEVE aparecer (não o spinner infinito)

### Requirement: Navbar link "Ajuda" respeita feature_tutorial flag

O link "❓ Ajuda" na barra de navegação superior (`Layout.jsx`) DEVE consultar `isActive('feature_tutorial')`. Se a flag não estiver ativa, o link NÃO DEVE ser renderizado no `<nav>`.

Isso é necessário porque o link leva a `/tutorial`, e a própria página Tutorial já redireciona para `/dashboard` quando `feature_tutorial` está inativa. Manter o link visível mas levando a uma página que redireciona é uma experiência de usuário confusa.

#### Scenario: Navbar hide Ajuda when tutorial is disabled
- **GIVEN** `feature_tutorial` tem `active: false`
- **WHEN** o usuário está autenticado e vê a barra de navegação
- **THEN** o link "❓ Ajuda" NÃO DEVE aparecer no `<nav>`

#### Scenario: Navbar show Ajuda when tutorial is enabled
- **GIVEN** `feature_tutorial` tem `active: true`
- **WHEN** o usuário está autenticado e vê a barra de navegação
- **THEN** o link "❓ Ajuda" DEVE aparecer no `<nav>`
