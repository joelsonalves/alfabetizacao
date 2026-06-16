## Why

Atualmente, todos os módulos de aprendizado (Vogais, Consoantes, Sílabas, Palavras, etc.) e recursos auxiliares (Tutorial, HelpButton, LevelUp) estão sempre disponíveis para todos os usuários. Não há como um administrador desativar seletivamente partes do sistema — por exemplo, desabilitar o módulo de "Orações" para uma turma que ainda não atingiu esse nível, ou ocultar o tutorial para usuários recorrentes.

Este change introduz um **sistema de feature flags** com controle por módulo/recurso, ativação/desativação via banco de dados, interface admin no frontend, e comportamento configurável (ocultar vs. mostrar bloqueado).

## What Changes

- **Modelo `FeatureFlag`** no banco: tabela `feature_flags` com `key` (identificador do recurso), `active` (boolean), `behavior_on_inactive` ("hidden" | "locked"), `description`
- **Checklist de recursos** mapeados no seed: Vogais, Consoantes, Sílabas Simples, Sílabas Complexas, Montagem Silábica, Palavras, Frases, Orações, Tutorial, HelpButton, LevelUp
- **Campo `is_admin`** na tabela `users` (boolean, default `false`)
- **Claims admin no JWT**: token inclui `is_admin: true/false`; `get_current_user` expõe o campo
- **Endpoint `GET /admin/feature-flags`**: lista todos os flags com status
- **Endpoint `PATCH /admin/feature-flags/{key}`**: ativa/desativa um flag
- **Endpoint `GET /admin/feature-flags/client`**: público (autenticado) — retorna flags ativos para o frontend filtrar
- **Frontend: página `/admin`**: listagem de todos os recursos com toggle switch, visível apenas para users com `is_admin === true`
- **Frontend: filtragem no Dashboard**: módulos com `active === false` e `behavior === "hidden"` não aparecem
- **Frontend: bloqueio condicional**: módulos com `active === false` e `behavior === "locked"` aparecem com cadeado
- **Frontend: HelpButton, LevelUp, Tutorial**: verificam flag antes de renderizar
- **Rota protegida `/admin`**: redireciona para `/dashboard` se usuário não for admin

## Capabilities

### New Capabilities
- `feature-flags-backend`: Modelo, seed, API CRUD e autorização admin (role `is_admin`)
- `feature-flags-frontend`: Página admin com toggles, filtragem no Dashboard, bloqueio de recursos condicional

### Modified Capabilities
<!-- Nenhuma spec existente é modificada — são novos comportamentos -->

## Impact

- `backend/app/models/user.py` — adicionar campo `is_admin`
- `backend/app/models/feature_flag.py` — novo modelo `FeatureFlag`
- `backend/app/schemas/` — novos schemas `FeatureFlagResponse`, `FeatureFlagUpdate`, `AdminUserResponse`
- `backend/app/services/auth.py` — incluir `is_admin` no JWT (`create_access_token`)
- `backend/app/routes/auth.py` — retornar `is_admin` no login/refresh/me
- `backend/app/routes/admin.py` — novo router com endpoints de feature-flags (protegido por admin)
- `backend/app/seed.py` — seed de feature flags para todos os recursos
- `backend/app/main.py` — registrar novo router admin
- `frontend/src/services/api.js` — novos métodos `admin.*` e `featureFlags.*`
- `frontend/src/hooks/useAuth.js` — expor `is_admin` do user
- `frontend/src/pages/Dashboard.jsx` — filtrar módulos por feature flag
- `frontend/src/pages/Admin.jsx` + `Admin.css` — nova página de administração
- `frontend/src/App.jsx` — adicionar rota `/admin` protegida
- `frontend/src/components/HelpButton/HelpButton.jsx` — verificar flag antes de renderizar
- `frontend/src/components/LevelUp/LevelUp.jsx` — verificar flag antes de renderizar
- `frontend/src/pages/Tutorial.jsx` — verificar flag antes de renderizar
- `frontend/src/components/Layout/Layout.jsx` — mostrar link "Admin" no nav se `is_admin`
