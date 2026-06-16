## Why

O sistema possui cobertura de testes moderada (~83% backend, ~73% frontend), mas com lacunas importantes: serviços inteiros sem teste (cleanup.py), fluxos de erro não cobertos (HTTP 409, token revogado, refresh falho) e componentes inteiros do frontend sem cobertura (Layout, HelpButton, ImageDisplay). Essas lacunas representam risco de regressão em produção — especialmente em fluxos críticos como autenticação e salvamento de progresso.

## What Changes

- **Backend**: 12 novos testes de integração e unidade, cobrindo:
  - Serviço de limpeza de tokens expirados (cleanup.py — atualmente 0% coberto)
  - Fluxos de erro de autenticação (header ausente, scheme inválido, token revogado)
  - Conflito de concorrência (HTTP 409 no optimistic locking)
  - Serviços de utilidade (hash/verify password, token expirado, criação de token)
  - Fallback de imagem (Unsplash com erro HTTP)
- **Frontend**: 20 novos testes unitários e de integração, cobrindo:
  - Componentes sem cobertura: Layout, HelpButton, ImageDisplay
  - Fluxos de erro e edge cases: refresh de token, 409 conflict, redirect sem auth
  - Estados de loading em páginas (Login, Register, Profile)
  - Interações completas: lesson result, level-up, erro de concorrência, navegação pós-registro

## Capabilities

### New Capabilities
- `backend-test-coverage`: Testes backend para serviços e fluxos de erro não cobertos atualmente
- `frontend-test-coverage`: Testes frontend para componentes, fluxos de erro e edge cases não cobertos

### Modified Capabilities
<!-- Nenhuma capability existente está sendo modificada — apenas ampliação de cobertura de testes -->

## Impact

- **Backend**: 12 novos arquivos/módulos de teste em `backend/tests/`; sem alteração em código de produção
- **Frontend**: 20 novos arquivos de teste em `frontend/src/tests/`; sem alteração em código de produção
- **Nenhuma mudança breaking**: Testes são estritamente aditivos, sem tocar em código de produção
- **Cobertura estimada**: Backend ~83% → ~90%; Frontend ~73% → ~85%
