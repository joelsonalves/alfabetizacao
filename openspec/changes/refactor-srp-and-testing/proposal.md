## Summary

Refatorar o código para seguir o Princípio da Responsabilidade Única (SRP):
extrair funções puras e especializadas dos componentes/handlers atuais,
criar módulos de utilitários e constantes, e adicionar testes unitários para
cada função extraída.

## Motivation

- Funções como `normalize()`, `isSubsequence()` e `tryExtractTarget()` estão
  duplicadas ou embutidas dentro de componentes React, impossibilitando teste
  isolado e reuso
- Lógica de domínio (cálculo de nível, validação de senha, geração de seed data)
  está misturada com I/O (DB, HTTP, localStorage)
- Não há testes unitários para funções puras — apenas testes de integração
  (pytest para API, React Testing Library para componentes)
- Dificuldade de leitura e manutenção: `Lesson.jsx` tem ~565 linhas, misturando
  lógica de speech, keyboard, matching, progresso e renderização

## Scope

### What IS in scope

**Backend:**
- Extrair `calculate_level(xp, current_level)` de `routes/progress.py`
- Extrair `validate_password(password)` de `routes/auth.py`
- Extrair `revoke_token(jti, token_type, user_id, expires_at, db)` de `routes/auth.py`
- Extrair `update_login_streak(user, today)` de `routes/auth.py`
- Extrair `fetch_unsplash_image(query, access_key)` de `routes/images.py`
- Extrair `build_fallback_image_response(word)` de `routes/images.py`
- Extrair geradores de seed: `generate_simple_syllables()`, `generate_complex_syllables()`,
  `generate_blending_words()`, `generate_words()`, `generate_phrases()`, `generate_sentences()`
- Extrair `collect_metrics(db)` de `main.py`
- Extrair `datetime_to_iso(value)` de `schemas/module.py`
- Extrair `extract_user_id_from_header(authorization)` de `main.py`
- Criar `tests/unit/` com testes para todas as funções extraídas

**Frontend:**
- Extrair `normalize(string)` → `src/utils/string.js` (remover duplicatas)
- Extrair `stripSpaces(string)` → `src/utils/string.js`
- Extrair `getExpectedChar(target, typedChars)` → `src/utils/string.js`
- Extrair `isSubsequence(targetWords, transcriptWords)` → `src/utils/array.js`
- Extrair `tryExtractTarget(transcript, target, sounds, lessonType)` → `src/utils/speech.js`
- Extrair `extractSpokenContent(...)` → `src/utils/speech.js`
- Extrair `parseLessonContent(lesson)` → `src/utils/lesson.js`
- Extrair `buildProgressMap(progress)` → `src/utils/progress.js`
- Extrair `createFeedback(type, message)` → `src/utils/feedback.js`
- Extrair `createSyntheticKeyboardEvent(key)` → `src/utils/keyboard.js`
- Extrair `storeAuthData(res)`, `clearAuthData()`, `getStoredTokens()`, `getStoredUser()` → `src/utils/auth.js`
- Extrair constantes para `src/constants/`: `lesson.js`, `speech.js`, `modules.js`, `keyboard.js`
- Criar `src/utils/__tests__/` com testes para cada utilitário

### What is NOT in scope

- Refatorar componentes React para reduzir tamanho (apenas extrair funções puras)
- Mudar comportamento ou lógica de negócio (apenas mover)
- Adicionar TypeScript
- Refatorar hooks completos (apenas extrair funções puras que estão dentro deles)
- Testes de integração ou e2e

## Structure after refactoring

```
backend/
├── app/
│   ├── services/           ← NOVO
│   │   ├── __init__.py
│   │   ├── auth.py         # revoke_token, update_login_streak, validate_password
│   │   ├── progress.py     # calculate_level, apply_progress_update
│   │   ├── images.py       # fetch_unsplash_image, build_fallback_image_response
│   │   └── seed.py         # generate_* lesson data generators
│   ├── utils/              ← NOVO
│   │   ├── __init__.py
│   │   └── datetime.py     # datetime_to_iso
│   └── routes/             # handlers ficam mais enxutos
├── tests/
│   └── unit/               ← NOVO
│       ├── test_auth_services.py
│       ├── test_progress_services.py
│       ├── test_images_services.py
│       └── test_seed_generators.py

frontend/
└── src/
    ├── utils/              ← NOVO
    │   ├── string.js       # normalize, stripSpaces, getExpectedChar
    │   ├── array.js        # isSubsequence
    │   ├── speech.js       # tryExtractTarget, extractSpokenContent
    │   ├── lesson.js       # parseLessonContent
    │   ├── progress.js     # buildProgressMap
    │   ├── feedback.js     # createFeedback, createFeedbackId
    │   ├── keyboard.js     # createSyntheticKeyboardEvent
    │   ├── auth.js         # storeAuthData, clearAuthData, getStoredTokens
    │   ├── __tests__/      # ← NOVO
    │       ├── string.test.js
    │       ├── array.test.js
    │       ├── speech.test.js
    │       ├── lesson.test.js
    │       ├── progress.test.js
    │       ├── feedback.test.js
    │       ├── keyboard.test.js
    │       └── auth.test.js
    └── constants/          ← NOVO
        ├── lesson.js       # POINTS, SPEECH_PREFIXES, SPEECH_TIMEOUTS
        ├── speech.js       # LETTER_SOUNDS, LETTER_WORDS
        ├── modules.js      # MODULE_ICONS
        └── keyboard.js     # ROWS, KEY_WIDTH, ABNT2_KEYS
```

## Risk assessment

| Risk | Mitigation |
|------|------------|
| Extração quebra funcionalidade existente | Manter import original redirecionando para novo local; testes unitários + CI |
| Testes novos frágeis ou mal escritos | Cada função pura tem inputs/outputs claros; testar boundary cases |
| Escopo grande demais | Priorizado por ordem de valor: funções puras + duplicadas primeiro |
| Seed refatorado pode perder dados gerados | Geradores são puros; o DB insert continua igual |
