## Why

O sistema de feature flags foi implementado, mas **não cumpre seu propósito**: desativar uma flag no admin não desativa o recurso correspondente. 

Problemas identificados:
1. **Módulos**: desativar `dashboard_module_vowel` esconde o card no Dashboard, mas as lições continuam acessíveis via URL direta (`/lesson/3/74`)
2. **HelpButton, LevelUp, Tutorial**: os componentes nunca verificam as flags — desativá-las no admin **não tem efeito algum**
3. **Cache Redis**: o admin PATCH não invalida o cache, então mudanças levam até 5 minutos para refletir
4. **Nomenclatura**: spec usa dot notation (`module.vowel`), código usa underscore (`dashboard_module_vowel`) — inconsistência que dificulta manutenção

## What Changes

1. **Backend `modules.py`**: Endpoints de módulos/lições devem filtrar por feature flags — impedir acesso via URL direta quando módulo está desativado
2. **Frontend `HelpButton.jsx`**: Verificar `isActive('feature_help_button')` antes de renderizar
3. **Frontend `LevelUp.jsx`**: Verificar `isActive('feature_level_up')` antes de exibir modal
4. **Frontend `Tutorial.jsx`**: Verificar `isActive('feature_tutorial')` antes de iniciar tutorial
5. **Admin PATCH**: Invalidar cache Redis (`feature_flags:all`) após alteração
6. **Normalizar nomenclatura**: Unificar para underscore (`dashboard_module_vowel`) no código e specs

## Capabilities

### Modified Capabilities
- `feature-flags-backend`: 
  - Endpoints de módulos/lições passam a filtrar por feature flag
  - Admin PATCH invalida cache Redis
- `feature-flags-frontend`:
  - HelpButton, LevelUp, Tutorial passam a verificar flags
  - Backend retorna 403/404 para módulos desativados (para impedir acesso direto)

## Impact

- `backend/app/routes/modules.py` — filtrar módulos por feature flag ativa
- `backend/app/routes/admin.py` — invalidar cache Redis no PATCH
- `frontend/src/components/HelpButton/HelpButton.jsx` — adicionar verificação de flag
- `frontend/src/components/LevelUp/LevelUp.jsx` — adicionar verificação de flag
- `frontend/src/pages/Tutorial.jsx` — adicionar verificação de flag
