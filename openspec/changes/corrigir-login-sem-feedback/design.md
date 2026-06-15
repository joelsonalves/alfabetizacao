## Context

O sistema possui autenticação JWT com refresh tokens. A função `request()` em `frontend/src/services/api.js` (linha 20) intercepta **todo** HTTP 401 e tenta renovar o token automaticamente. Isso funciona bem para endpoints protegidos cujo token expirou, mas **quebra o fluxo de login**: quando o backend retorna 401 por credenciais inválidas, a request cai no mesmo fluxo de refresh.

### Fluxo atual (bug)

```
Usuário → Login.jsx → handleSubmit()
  → useAuth.login(data)
    → api.auth.login(data)
      → request('/auth/login', { method: 'POST', body })
        → fetch() retorna 401 {"detail": "Invalid email or password"}
        → [LINHA 20] res.status === 401 && !options._retry? SIM
          → localStorage.getItem('refresh_token')? null (não logado)
          → [LINHA 58-62] else:
              → window.location.href = '/login' (redirect para mesma página)
              → throw new Error('Unauthorized')
        → Login.jsx catch: setError('Unauthorized')  ← mensagem errada
```

### Fluxo esperado (após correção)

```
Usuário → Login.jsx → handleSubmit()
  → useAuth.login(data)
    → api.auth.login(data)
      → request('/auth/login', { method: 'POST', body })
        → fetch() retorna 401 {"detail": "Invalid email or password"}
        → [LINHA 20] res.status === 401 && !options._retry && !path.endsWith('/auth/login')? NÃO (pula refresh)
        → [LINHA 65] if (!res.ok)? SIM
          → err = await res.json() → { detail: "Invalid email or password" }
          → throw new Error("Invalid email or password")
        → Login.jsx catch: setError("Invalid email or password")  ← mensagem correta
```

## Goals / Non-Goals

**Goals:**
- Usuário deve ver a mensagem de erro do backend ao tentar login com credenciais inválidas
- Mensagem deve ser clara e em português brasileiro
- Fluxo de refresh de token para endpoints autenticados deve continuar funcionando normalmente

**Non-Goals:**
- Não alterar a lógica de refresh para outros endpoints
- Não adicionar novos testes (o teste existente já cobre o cenário)
- Não alterar o comportamento de sucesso do login

## Decisions

| Decisão | Alternativas Consideradas | Justificativa |
|---|---|---|
| **Excluir `/auth/login` do refresh 401** (verificar `path.endsWith`) | Adicionar flag `_skipRefresh` nas opções da request | Mais simples e não requer modificar chamadores. A checagem por path é estável porque o endpoint é fixo |
| **Mensagem de erro em português no backend** | Deixar em inglês e traduzir no frontend | O teste já espera português. A mensagem vinda do backend é a fonte da verdade. Manter consistência: frontend exibe o que o backend retorna |
| **Não tratar login 401 no backend de forma diferente** | Criar um status code específico para login inválido (ex: 403) | 401 é semanticamente correto para "não autenticado". O problema é exclusivamente no frontend |

## Risks / Trade-offs

- **Risco mínimo**: A condição `path.endsWith('/auth/login')` é específica o suficiente para não afetar outros endpoints. Se novos endpoints de autenticação forem adicionados (ex: `/auth/recover-password`), a condição deve ser revisada.
- **Teste existente**: O teste `Login.test.jsx` mocka o hook `useAuth` e testa a exibição da mensagem `"Email ou senha inválidos"` — ele continuará passando com a correção.
