## 1. Backend: Utilitários

- [ ] 1.1 Criar `app/utils/__init__.py` e `app/utils/datetime.py` com `datetime_to_iso()`
- [ ] 1.2 Importar e usar em `schemas/module.py`, remover inline
- [ ] 1.3 Criar `tests/unit/test_datetime_utils.py` com 3+ testes

## 2. Backend: Services — Auth

- [ ] 2.1 Criar `app/services/__init__.py` e `app/services/auth.py`
- [ ] 2.2 Extrair `validate_password(password)` (pura)
- [ ] 2.3 Extrair `calculate_streak(last_active_date, today)` (pura)
- [ ] 2.4 Extrair `update_login_streak(user, db, today)` (DB)
- [ ] 2.5 Extrair `revoke_token(jti, token_type, user_id, expires_at, db)` (DB)
- [ ] 2.6 Refatorar `routes/auth.py` para usar os services
- [ ] 2.7 Criar `tests/unit/test_auth_services.py` com 5+ testes

## 3. Backend: Services — Progress

- [ ] 3.1 Criar `app/services/progress.py`
- [ ] 3.2 Extrair `calculate_level(xp, current_level)` (pura)
- [ ] 3.3 Extrair `xp_needed_for_level(level)` (pura)
- [ ] 3.4 Extrair `check_version_conflict(progress_version, data_version)` (pura)
- [ ] 3.5 Refatorar `routes/progress.py` para usar os services
- [ ] 3.6 Criar `tests/unit/test_progress_services.py` com 5+ testes

## 4. Backend: Services — Images

- [ ] 4.1 Criar `app/services/images.py`
- [ ] 4.2 Extrair `build_fallback_image_response(word)` (pura)
- [ ] 4.3 Extrair `fetch_unsplash_image(query, access_key)` (HTTP)
- [ ] 4.4 Refatorar `routes/images.py` para usar os services
- [ ] 4.5 Criar `tests/unit/test_images_services.py` com 3+ testes

## 5. Backend: Services — Seed data generators

- [ ] 5.1 Criar `app/services/seed.py` com `generate_simple_syllables()`, `generate_complex_syllables()`, `generate_blending_words()`, `generate_words()`, `generate_phrases()`, `generate_sentences()`
- [ ] 5.2 Refatorar `app/seed.py` para importar e chamar os geradores
- [ ] 5.3 Criar `tests/unit/test_seed_generators.py` com 6+ testes (um por gerador)

## 6. Backend: Testes unitários gerais

- [ ] 6.1 Configurar `tests/unit/conftest.py` com fixtures
- [ ] 6.2 Rodar `pytest` e confirmar todos os testes (+unit) passando

## 7. Frontend: Constantes

- [ ] 7.1 Criar `src/constants/lesson.js` com POINTS, SPEECH_PREFIXES, SPEECH_TYPE_LABELS, SPEECH_TYPE_NAMES, SPEECH_TIMEOUTS
- [ ] 7.2 Atualizar `Lesson.jsx` para importar de `constants/lesson.js`
- [ ] 7.3 Criar `src/constants/speech.js` com LETTER_SOUNDS, LETTER_WORDS
- [ ] 7.4 Atualizar `useSpeech.js` e `Lesson.jsx` para importar de `constants/speech.js`
- [ ] 7.5 Criar `src/constants/modules.js` com MODULE_ICONS
- [ ] 7.6 Atualizar `Dashboard.jsx` para importar de `constants/modules.js`
- [ ] 7.7 Criar `src/constants/keyboard.js` com ROWS, KEY_WIDTH, ABNT2_KEYS
- [ ] 7.8 Atualizar `VirtualKeyboard.jsx` e `useKeyboard.js` para importar de `constants/keyboard.js`

## 8. Frontend: Utilitários — String

- [ ] 8.1 Criar `src/utils/string.js` com `normalize()`, `stripSpaces()`, `getExpectedChar()`
- [ ] 8.2 Atualizar `Lesson.jsx`, `SyllableBlending.jsx`, `useKeyboard.js` para importar de lá
- [ ] 8.3 Criar `src/utils/__tests__/string.test.js` com 9+ testes

## 9. Frontend: Utilitários — Array e Speech

- [ ] 9.1 Criar `src/utils/array.js` com `isSubsequence()`
- [ ] 9.2 Atualizar `Lesson.jsx` para importar
- [ ] 9.3 Criar `src/utils/__tests__/array.test.js` com 3+ testes
- [ ] 9.4 Criar `src/utils/speech.js` com `tryExtractTarget()`, `extractSpokenContent()`
- [ ] 9.5 Atualizar `Lesson.jsx` para importar
- [ ] 9.6 Criar `src/utils/__tests__/speech.test.js` com 8+ testes (várias estratégias de matching)

## 10. Frontend: Utilitários — Lesson, Progress, Feedback, Keyboard, Auth

- [ ] 10.1 Criar `src/utils/lesson.js` com `parseLessonContent()`
- [ ] 10.2 Atualizar `SyllableBlending.jsx` e criar `__tests__/lesson.test.js`
- [ ] 10.3 Criar `src/utils/progress.js` com `buildProgressMap()`, `findProgressByLessonId()`
- [ ] 10.4 Atualizar `Dashboard.jsx` e `Lesson.jsx` e criar `__tests__/progress.test.js`
- [ ] 10.5 Criar `src/utils/feedback.js` com `createFeedback()`
- [ ] 10.6 Atualizar `Lesson.jsx` e criar `__tests__/feedback.test.js`
- [ ] 10.7 Criar `src/utils/keyboard.js` com `createSyntheticKeyboardEvent()`
- [ ] 10.8 Atualizar `useKeyboard.js` e criar `__tests__/keyboard.test.js`
- [ ] 10.9 Criar `src/utils/auth.js` com `storeAuthData()`, `clearAuthData()`, `getStoredTokens()`, `getStoredUser()`
- [ ] 10.10 Atualizar `AuthContext.jsx` e `api.js` e criar `__tests__/auth.test.js` (com mock localStorage)

## 11. Verificação final

- [ ] 11.1 Rodar `pytest` e confirmar todos os testes passando (incluindo novos unitários)
- [ ] 11.2 Rodar `npm test` e confirmar todos os testes passando (incluindo novos unitários)
- [ ] 11.3 Verificar que a aplicação roda sem erros (backend + frontend)
- [ ] 11.4 Verificar que não há funções/constantes duplicadas no código
