## Why

O backend já possui endpoints CRUD completos para definições de conquistas (`/api/admin/achievements`), mas não há interface administrativa para gerenciá-las. O admin precisa de uma UI para listar, criar, editar e excluir definições de conquistas, incluindo tipo, nome, descrição, ícone e status ativo/inativo.

## What Changes

- **Admin.jsx**: nova aba "Conquistas" com tabela listando todas as definições, formulário de criação, edição inline e exclusão
- **API client (`api.js`)**: adicionar métodos `admin.listAchievements`, `admin.createAchievement`, `admin.updateAchievement`, `admin.deleteAchievement`
- **Nenhuma mudança no backend** — os endpoints já existem em `backend/app/routes/config.py`

## Capabilities

### New Capabilities
- `achievements-admin-ui`: Interface administrativa para gerenciar definições de conquistas

### Modified Capabilities

Nenhuma — funcionalidade inteiramente nova no frontend.

## Impact

- **Frontend apenas**: `frontend/src/pages/Admin.jsx` + `frontend/src/services/api.js`
- **Backend**: sem alterações — endpoints já existem e funcionam
