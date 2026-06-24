## 1. Frontend: Corrigir interceptação de 404 no login

- [x] 1.1 Modificar `frontend/src/services/api.js` linha 20 para excluir `/auth/login` da lógica de refresh:
  ```javascript
  // Antes:
  if (res.status === 401 && !options._retry) {
  // Depois:
  if (res.status === 401 && !options._retry && !path.endsWith('/auth/login')) {
  ```

## 2. Backend: Localizar mensagem de erro

- [x] 2.1 Modificar `backend/app/routes/auth.py` linha 62 para retornar mensagem em português:
  ```python
  # Antes:
  raise HTTPException(status_code=401, detail="Invalid email or password")
  # Depois:
  raise HTTPException(status_code=401, detail="Email ou senha inválidos")
  ```

## 3. Verificação

- [x] 3.1 Executar testes frontend: `npx vitest run` — verificar que `Login.test.jsx` passa
- [x] 3.2 Executar testes backend: `pytest` — verificar que testes de auth continuam passando
- [x] 3.3 Testar manualmente: acessar `/login`, digitar credenciais inválidas, confirmar que a mensagem `"Email ou senha inválidos"` é exibida ✅ (confirmado pelo usuário)
