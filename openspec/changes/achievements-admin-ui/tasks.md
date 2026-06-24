## 1. API Client — Admin achievement methods

- [x] 1.1 Em `frontend/src/services/api.js`, adicionar ao objeto `api.admin`: `listAchievements`, `createAchievement`, `updateAchievement`, `deleteAchievement`

## 2. Admin UI — Aba Conquistas

- [x] 2.1 Criar componente `AchievementsTab` em `Admin.jsx` com:
  - [x] 2.1.1 Estado `achievements` e `loading`, carregados via `api.admin.listAchievements()`
  - [x] 2.1.2 Tabela com colunas: Tipo, Nome, Descrição, Ícone, Ativo, Ações
- [x] 2.2 Implementar edição inline:
  - [x] 2.2.1 Botão "Editar" transforma nome/descrição/ícone/ativo em inputs (tipo readonly)
  - [x] 2.2.2 Salvar chama `api.admin.updateAchievement(type, data)` e recarrega
- [x] 2.3 Implementar formulário de criação:
  - [x] 2.3.1 Botão "+ Nova Conquista" expande formulário com campos type, name, description, icon, active
  - [x] 2.3.2 Submit chama `api.admin.createAchievement(data)` e recarrega
- [x] 2.4 Implementar exclusão:
  - [x] 2.4.1 Botão "Excluir" com `window.confirm` e chamada `api.admin.deleteAchievement(type)`
- [x] 2.5 Registrar aba "Conquistas" no componente `Admin`:
  - [x] 2.5.1 Adicionar botão `tab === 'achievements'` na navegação
  - [x] 2.5.2 Renderizar condicional `{tab === 'achievements' && <AchievementsTab />}`

## 3. Verificação

- [ ] 3.1 Aba Conquistas aparece no admin e lista definições existentes
- [ ] 3.2 Criar nova conquista → aparece na tabela
- [ ] 3.3 Editar nome/descrição/ícone/ativo de conquista → reflete na tabela
- [ ] 3.4 Excluir conquista → some da tabela após confirmação
- [ ] 3.5 Verificar que não é possível editar `achievement_type`
