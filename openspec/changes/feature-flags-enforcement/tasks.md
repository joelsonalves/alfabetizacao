## 1. Backend — Módulos filtram por feature flag

- [x] 1.1 Em `backend/app/routes/modules.py`: atualizar `GET /api/modules` para filtrar módulos cuja flag correspondente está inativa
- [x] 1.2 Em `backend/app/routes/modules.py`: atualizar `GET /api/modules/{module_id}/lessons` e `GET /lessons/{lesson_id}` para retornar 403 se o módulo estiver desativado

## 2. Backend — Admin PATCH invalida cache Redis

- [x] 2.1 Em `backend/app/routes/admin.py`: adicionar `cache.delete("feature_flags:all")` e `cache.delete("modules:all")` (se for flag de módulo) no endpoint `PATCH /admin/feature-flags/{key}`

## 3. Frontend — HelpButton verifica flag

- [x] 3.1 Em `frontend/src/components/HelpButton/HelpButton.jsx`: importar `useFeatureFlags` e verificar `isActive('feature_help_button')` — retornar `null` se inativo

## 4. Frontend — LevelUp verifica flag

- [x] 4.1 Em `frontend/src/pages/Lesson.jsx`: antes de renderizar `<LevelUp>`, verificar `isFlagActive('feature_level_up')`

## 5. Frontend — Tutorial verifica flag

- [x] 5.1 Em `frontend/src/pages/Tutorial.jsx`: importar `useFeatureFlags` e redirecionar para `/dashboard` se `isActive('feature_tutorial')` for falso

## 6. Frontend — Tratamento de módulo desativado na lição

- [x] 6.1 Em `backend/app/routes/modules.py`: alterar status code de 404 para 403 quando módulo estiver desativado (tanto em `list_lessons` quanto em `get_lesson`)
- [x] 6.2 Em `frontend/src/pages/Lesson.jsx`: no `.catch()`, detectar erro 403 e renderizar tela com 🔒, "Módulo Indisponível" e botão "Ir para o Dashboard"

## 8. Frontend — Navbar link "Ajuda" verifica feature_tutorial

- [ ] 8.1 Em `frontend/src/components/Layout/Layout.jsx`: importar `useFeatureFlags`, consumir `isActive`, e renderizar condicionalmente o link "❓ Ajuda" com `isActive('feature_tutorial')`

## 9. Verificação

- [ ] 9.1 Testar desativar módulo Vogais no admin → módulo some do Dashboard e URL direta retorna 403 com mensagem amigável
- [ ] 9.2 Testar desativar `feature_help_button` → botão de ajuda some
- [ ] 9.3 Testar desativar `feature_level_up` → completar lição não mostra modal
- [ ] 9.4 Testar desativar `feature_tutorial` → link "❓ Ajuda" some da navbar e `/tutorial` redireciona
- [ ] 9.5 Testar que cache Redis é invalidado após toggle no admin
- [ ] 9.6 Testar que lição inexistente continua retornando 404 (não confundir com 403)
