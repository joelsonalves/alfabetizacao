# Achievements — Admin UI

## ADDED Requirements

### Requirement: Admin page has "Conquistas" tab

O Admin.jsx DEVE incluir uma aba "Conquistas" na navegação por tabs, ao lado de Flags, Módulos e Conteúdo. O parâmetro de URL DEVE ser `tab=achievements`.

#### Scenario: Achievements tab is visible
- **GIVEN** um admin na página `/admin`
- **WHEN** a página renderiza as abas
- **THEN** DEVE haver um botão "Conquistas" na navegação de abas
- **AND** o parâmetro de URL DEVE ser `tab=achievements`

### Requirement: Tabela lista todas as definições

A aba Conquistas DEVE exibir uma tabela com todas as definições cadastradas, contendo as colunas:
- Tipo (`achievement_type`)
- Nome (`name`)
- Descrição (`description`)
- Ícone (`icon`)
- Ativo (`active` — toggle switch)

A listagem DEVE ser carregada via `GET /api/admin/achievements`.

#### Scenario: Table displays all achievements
- **GIVEN** 5 definições cadastradas
- **WHEN** o admin abre a aba Conquistas
- **THEN** a tabela DEVE mostrar 5 linhas
- **AND** cada linha DEVE mostrar tipo, nome, descrição, ícone e status ativo/inativo

### Requirement: Admin pode editar definição inline

Cada linha da tabela DEVE ter um botão "Editar" que transforma os campos nome, descrição, ícone e ativo em inputs editáveis. O tipo (`achievement_type`) NÃO DEVE ser editável.

Ao salvar, DEVE chamar `PUT /api/admin/achievements/{achievement_type}`.
Ao cancelar, DEVE restaurar os valores originais.

#### Scenario: Edit achievement definition
- **GIVEN** uma definição `first_lesson` na tabela
- **WHEN** o admin clica "Editar"
- **THEN** os campos nome, descrição, ícone e ativo DEVEM tornar-se editáveis
- **AND** o campo tipo DEVE permanecer somente leitura
- **WHEN** o admin altera o nome para "Minha Primeira Lição!" e salva
- **THEN** `PUT /api/admin/achievements/first_lesson` DEVE ser chamado
- **AND** a tabela DEVE refletir o novo nome

### Requirement: Admin pode criar nova definição

A aba Conquistas DEVE ter um botão "+ Nova Conquista" que expande um formulário de criação com campos:
- Tipo (`achievement_type`) — obrigatório, único
- Nome (`name`) — obrigatório
- Descrição (`description`) — opcional
- Ícone (`icon`) — opcional, campo de texto para emoji
- Ativo (`active`) — padrão true

Ao submeter, DEVE chamar `POST /api/admin/achievements`.

#### Scenario: Create new achievement
- **GIVEN** o formulário de criação expandido
- **WHEN** o admin preenche tipo="super_streak", nome="Super Sequência", descrição="Estude por 60 dias", ícone="🌟" e clica "Criar"
- **THEN** `POST /api/admin/achievements` DEVE ser chamado com os dados
- **AND** a tabela DEVE incluir a nova definição

### Requirement: Admin pode excluir definição

Cada linha DEVE ter um botão "Excluir" que, após confirmação (`window.confirm`), chama `DELETE /api/admin/achievements/{achievement_type}`.

A confirmação DEVE alertar que conquistas já desbloqueadas por usuários continuarão existindo mas sem referência de definição.

#### Scenario: Delete achievement with confirmation
- **GIVEN** uma definição `super_streak` na tabela
- **WHEN** o admin clica "Excluir"
- **THEN** uma confirmação DEVE aparecer: "Tem certeza? Conquistas já desbloqueadas por usuários continuarão existindo."
- **WHEN** o admin confirma
- **THEN** `DELETE /api/admin/achievements/super_streak` DEVE ser chamado
- **AND** a definição DEVE sumir da tabela

### Requirement: API client tem métodos admin de achievements

O objeto `api.admin` em `frontend/src/services/api.js` DEVE expor:
- `api.admin.listAchievements()` → `GET /api/admin/achievements`
- `api.admin.createAchievement(data)` → `POST /api/admin/achievements`
- `api.admin.updateAchievement(type, data)` → `PUT /api/admin/achievements/{type}`
- `api.admin.deleteAchievement(type)` → `DELETE /api/admin/achievements/{type}`

#### Scenario: API methods exist
- **GIVEN** o objeto `api.admin`
- **WHEN** inspecionado
- **THEN** DEVE conter `listAchievements`, `createAchievement`, `updateAchievement`, `deleteAchievement`
