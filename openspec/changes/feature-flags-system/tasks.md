## 1. Backend: Modelos e migração

- [ ] 1.1 Adicionar campo `is_admin` (Boolean, default False) ao modelo `User`
- [ ] 1.2 Criar modelo `FeatureFlag` com `key` (String, unique), `active` (Boolean), `behavior_on_inactive` (String), `description` (Text)
- [ ] 1.3 Adicionar `require_admin` dependency em `app/routes/auth.py`
- [ ] 1.4 Incluir `is_admin` no payload JWT (`create_access_token`) e na resposta de login/refresh/me

## 2. Backend: Endpoints e seed

- [ ] 2.1 Criar router `app/routes/admin.py` com `GET /admin/feature-flags` e `PATCH /admin/feature-flags/{key}`
- [ ] 2.2 Criar router `app/routes/feature_flags.py` com `GET /feature-flags` (público autenticado)
- [ ] 2.3 Criar schemas `FeatureFlagResponse`, `FeatureFlagUpdate` em `app/schemas/feature_flag.py`
- [ ] 2.4 Adicionar `is_admin` ao `UserResponse` schema
- [ ] 2.5 Registrar ambos os routers em `app/main.py`
- [ ] 2.6 Atualizar `seed.py` para criar 11 feature flags + usuário admin (admin@admin.com)

## 3. Frontend: Contexto FeatureFlags

- [ ] 3.1 Criar `frontend/src/context/FeatureFlagsContext.jsx` com fetch de flags, `isActive(key)`, `getBehavior(key)`, `refresh()`
- [ ] 3.2 Envolver o App com `FeatureFlagsProvider`
- [ ] 3.3 Adicionar `api.featureFlags.list()` e `api.admin.listFlags()` / `api.admin.updateFlag()` em `api.js`

## 4. Frontend: Página Admin

- [ ] 4.1 Criar `frontend/src/components/AdminRoute/AdminRoute.jsx` (verifica `is_admin`, redireciona)
- [ ] 4.2 Criar `frontend/src/pages/Admin.jsx` + `Admin.css` com tabela de flags, toggle switches, behavior selector
- [ ] 4.3 Adicionar rota `/admin` protegida em `App.jsx`
- [ ] 4.4 Adicionar link "Admin" no `Layout.jsx` quando `user.is_admin`

## 5. Frontend: Filtragem por flags

- [ ] 5.1 Modificar `Dashboard.jsx` para filtrar módulos conforme flags (hidden/locked)
- [ ] 5.2 Modificar `HelpButton.jsx` para checar `feature.help_button`
- [ ] 5.3 Modificar `LevelUp.jsx` para checar `feature.level_up`
- [ ] 5.4 Modificar `Tutorial.jsx` para checar `feature.tutorial`

## 6. Testes

- [ ] 6.1 Rodar `pytest` e confirmar 71+ testes passando
- [ ] 6.2 Rodar `npm test` e confirmar 132+ testes passando
- [ ] 6.3 Testar manualmente: login admin, toggle flag, verificar Dashboard
