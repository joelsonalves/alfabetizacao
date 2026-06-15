# Login Error Feedback

## Overview

Corrige o fluxo de erro de login para que a mensagem retornada pelo backend seja exibida ao usuário, em vez de ser engolida pela lógica de refresh de token.

## Requirements

### REQ-001: Exibir erro do backend no login

O sistema DEVE exibir a mensagem de erro retornada pelo backend quando o login falha por credenciais inválidas.

#### Scenario: Credenciais inválidas exibem mensagem do backend
- **GIVEN** um usuário não cadastrado OU senha incorreta
- **WHEN** o usuário submete o formulário de login com credenciais inválidas
- **THEN** o backend retorna HTTP 401 com `{"detail": "Email ou senha inválidos"}`
- **AND** o frontend exibe a mensagem `"Email ou senha inválidos"` no formulário de login
- **AND** o usuário permanece na página de login

#### Scenario: Token expirado continua funcionando
- **GIVEN** um usuário logado com token expirado
- **WHEN** o usuário faz uma request para um endpoint protegido (ex: `/api/modules`)
- **THEN** o frontend tenta renovar o token via refresh token
- **AND** se o refresh falhar, redireciona para `/login`
- **AND** o fluxo de login NÃO é afetado

### REQ-002: Mensagem de erro em português

O backend DEVE retornar a mensagem de erro de login em português brasileiro.

#### Scenario: Mensagem localizada
- **GIVEN** o endpoint `POST /api/auth/login`
- **WHEN** as credenciais são inválidas
- **THEN** o campo `detail` da resposta HTTP 401 deve ser `"Email ou senha inválidos"`

## Technical Design

### Frontend: `frontend/src/services/api.js`

**Localização da mudança:** Linha 20.

**Antes:**
```javascript
if (res.status === 401 && !options._retry) {
```

**Depois:**
```javascript
if (res.status === 401 && !options._retry && !path.endsWith('/auth/login')) {
```

**Justificativa:** A condição adicional `!path.endsWith('/auth/login')` faz com que o 401 do endpoint de login não entre no fluxo de refresh de token, caindo no bloco `if (!res.ok)` da linha 65 que extrai e lança o `err.detail` correto.

### Backend (opcional): `backend/app/routes/auth.py`

**Localização da mudança:** Linha 62.

**Antes:**
```python
raise HTTPException(status_code=401, detail="Invalid email or password")
```

**Depois:**
```python
raise HTTPException(status_code=401, detail="Email ou senha inválidos")
```

**Justificativa:** Alinhar a mensagem de erro com o português brasileiro, consistente com o resto da interface e com a expectativa do teste existente.

## Test Verification

### Teste existente que continua válido

`frontend/src/tests/Login.test.jsx` — teste "shows error on failed login":
- Mocka `login` para rejeitar com `new Error('Email ou senha inválidos')`
- Preenche formulário, clica em Entrar
- Verifica que `"Email ou senha inválidos"` está visível na tela

### Verificação manual (ou e2e)

1. Acessar `/login`
2. Digitar e-mail não cadastrado e senha qualquer
3. Clicar em "Entrar"
4. **Esperado:** Mensagem `"Email ou senha inválidos"` aparece no formulário
5. **Esperado:** Usuário permanece na página de login
6. **Esperado:** Nenhum redirect indesejado ocorre
