## Why

Ao tentar login com credenciais inválidas (e-mail não cadastrado ou senha incorreta), o sistema não exibe nenhuma mensagem de erro para o usuário. O formulário de login apenas "pisca" sem feedback, dando a impressão de que o sistema está quebrado ou travado. Isso acontece porque o frontend trata todo HTTP 401 como token expirado (fluxo de refresh), em vez de distinguir entre "credenciais inválidas" e "token expirado".

## What Changes

- **Correção no `frontend/src/services/api.js`**: Excluir o endpoint `/auth/login` da lógica de refresh automático de token, permitindo que o 401 de credenciais inválidas propague a mensagem real do backend para o usuário.
- **Opcional — Localização da mensagem de erro no backend**: Alterar o `detail` do `HTTPException` no endpoint `POST /api/auth/login` de `"Invalid email or password"` para `"Email ou senha inválidos"` (português), alinhando com a expectativa do teste existente em `Login.test.jsx`.

## Capabilities

### New Capabilities
Nenhuma — trata-se apenas de correção de bug.

### Modified Capabilities
- `user-auth` (modificado): A resposta de erro de login agora propaga corretamente a mensagem de erro do backend para a interface do usuário.

## Impact

- **Frontend**: Uma linha modificada em `frontend/src/services/api.js` (condicional no bloco de refresh 401)
- **Backend** (opcional): Uma linha modificada em `backend/app/routes/auth.py` (mensagem de erro em português)
- **Testes**: O teste existente em `frontend/src/tests/Login.test.jsx` já cobre o cenário com a mensagem `"Email ou senha inválidos"` — se a mensagem do backend for alterada para português, o teste de integração também passará a refletir o comportamento real.
- **Nenhuma mudança breaking**: A correção é pontual e restaura o comportamento esperado.
