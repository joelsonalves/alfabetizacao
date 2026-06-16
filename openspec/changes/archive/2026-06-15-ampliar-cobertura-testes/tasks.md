## 1. Backend — Serviço de Limpeza (Cleanup)

- [x] 1.1 Criar `backend/tests/test_cleanup.py` com test_sync_cleanup_deletes_expired_tokens
- [x] 1.2 Adicionar test_async_cleanup_task_starts_without_error

## 2. Backend — Fluxos de Erro de Autenticação

- [x] 2.1 Criar `backend/tests/test_auth_errors.py` com test_missing_authorization_header
- [x] 2.2 Adicionar test_invalid_authorization_scheme
- [x] 2.3 Adicionar test_revoked_token_blocklisted_jti

## 3. Backend — Optimistic Locking (HTTP 409)

- [x] 3.1 Criar `backend/tests/test_optimistic_locking.py` com test_version_mismatch_causes_conflict
- [x] 3.2 Adicionar test_version_increments_after_successful_update

## 4. Backend — Unsplash Fallback e Utilitários

- [x] 4.1 Criar `backend/tests/test_unsplash_fallback.py` com test_unsplash_returns_non_200
- [x] 4.2 Criar `backend/tests/test_auth_utils.py` com test_hash_and_verify_password
- [x] 4.3 Adicionar test_decode_expired_token_returns_none e test_create_token_without_sub
- [x] 4.4 Criar `backend/tests/test_concurrent_progress.py` com test_two_users_save_progress_same_lesson

## 5. Frontend — Componentes Sem Cobertura

- [x] 5.1 Criar `frontend/src/tests/Layout.test.jsx` com navegação, logout e skip-link
- [x] 5.2 Criar `frontend/src/tests/HelpButton.test.jsx` com toggle, tecla Escape e contextos
- [x] 5.3 Criar `frontend/src/tests/ImageDisplay.test.jsx` com emoji, image url e null

## 6. Frontend — AuthContext e API Service Edge Cases

- [x] 6.1 Criar `frontend/src/tests/AuthContext.test.jsx` com refresh no startup e falha de refresh
- [x] 6.2 Atualizar `frontend/src/tests/api.test.js` com 401 refresh+retry e 409 conflict

## 7. Frontend — Páginas e Fluxos Faltantes

- [x] 7.1 Criar `frontend/src/tests/Register.test.jsx` com loading state, password validation e redirect pós-registro
- [x] 7.2 Atualizar `frontend/src/tests/Lesson.test.jsx` com lesson result, retry error, level up modal
- [x] 7.3 Criar `frontend/src/tests/Profile.test.jsx` com loading state
- [x] 7.4 Atualizar `frontend/src/tests/App.test.jsx` com redirect quando não autenticado

## 8. Verificação Final

- [x] 8.1 Executar `npm test` no frontend — todos os 108 testes passam
- [x] 8.2 Executar `pytest` no backend — todos os 68 testes passam
- [x] 8.3 Confirmar `openspec status --json` mostra mudança completa
