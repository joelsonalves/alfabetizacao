## Context

Atualmente o sistema não diferencia recursos ativos de inativos. Todos os 8 módulos de aprendizado (Vogais a Orações) e recursos auxiliares (Tutorial, HelpButton, LevelUp) estão sempre disponíveis. Não há conceito de "administrador" — todo usuário logado tem os mesmos privilégios.

O sistema já possui:
- Autenticação JWT com `create_access_token` e `get_current_user`
- Seed data em `seed.py` que cria módulos e lições
- Dashboard que lista todos os módulos via `api.modules.list()`
- Componentes HelpButton, LevelUp, Tutorial que renderizam incondicionalmente

## Goals / Non-Goals

**Goals:**
- Criar modelo `FeatureFlag` com `key`, `active`, `behavior_on_inactive`, `description`
- Adicionar campo `is_admin` ao modelo `User`
- Incluir `is_admin` no payload JWT e na resposta de login/refresh/me
- Seed inicial com 11 flags (8 módulos + Tutorial + HelpButton + LevelUp)
- Endpoints admin para listar e toggle flags (protegidos por role admin)
- Endpoint público (autenticado) para o frontend consultar flags ativas
- Página `/admin` no frontend com toggle switches
- Dashboard filtra módulos conforme flags
- HelpButton, LevelUp, Tutorial verificam flag antes de renderizar

**Non-Goals:**
- Não implementar CRUD completo de flags (criação/remoção) — apenas toggle activate/deactivate
- Não implementar auditoria de quem alterou flags
- Não implementar flags por usuário — são globais

## Decisions

### 1. Tabela única `feature_flags` vs. coluna `active` em cada modelo

**Decisão:** Tabela única `feature_flags` com chave string.

- Alternativa (coluna `active` em `LearningModule`): exigiria modificar o modelo existente e não cobriria recursos não-modulares (Tutorial, HelpButton).
- Tabela única é extensível: qualquer novo recurso no futuro adiciona uma linha no seed.

### 2. Nomenclatura das chaves

**Decisão:** Prefixo `module.` para módulos, `feature.` para recursos auxiliares.

```
module.vowel
module.consonant
module.simple_syllable
module.complex_syllable
module.blending
module.word
module.phrase
module.sentence
feature.tutorial
feature.help_button
feature.level_up
```

### 3. Endpoint público vs. admin

**Decisão:** Dois endpoints separados.

- `GET /admin/feature-flags` — retorna TODOS os flags (protegido por admin)
- `GET /feature-flags` — retorna apenas `active === true` (qualquer user autenticado)

O frontend chama `/feature-flags` no carregamento e armazena num contexto ou estado global.

### 4. Cache de flags no frontend

**Decisão:** Sem cache persistente. As flags são buscadas uma vez ao carregar o app (via contexto `FeatureFlagsContext`) e mantidas em memória durante a sessão. O admin pode refreshar manualmente.

### 5. Admin role no JWT

**Decisão:** Campo `is_admin` no payload do token e na resposta do login.

```python
# create_access_token
data["is_admin"] = user.is_admin
```

`get_current_user` retorna o usuário com `is_admin`. Endpoints admin usam `Depends(require_admin)`:

```python
def require_admin(user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
```

### 6. Rota `/admin` protegida no frontend

**Decisão:** Componente wrapper `<AdminRoute>` que verifica `user.is_admin` e redireciona para `/dashboard` se não for admin. Rota em `App.jsx`:

```jsx
<Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
```

### 7. Seed de flags

**Decisão:** O seed cria as 11 flags incondicionalmente (diferente dos módulos que pulam se já existirem). Usa `db.query(FeatureFlag).count()` para decidir se popula.

### 8. Dashboard filtering

**Decisão:** O Dashboard recebe a lista de flags via contexto. Module cards são filtrados:
- `active === true` → renderiza normal
- `active === false && behavior === "hidden"` → não renderiza
- `active === false && behavior === "locked"` → renderiza com classe `module-card--locked`, onClick desabilitado, tooltip "Recurso desativado"

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| **Flags desatualizadas no frontend** | Buscar flags no mount do App; baixa probabilidade de mudança durante sessão |
| **Admin esconde módulo que usuário já tinha progresso** | Progresso permanece no BD; se reativar, o usuário retoma de onde parou |
| **Usuário admin por seed** | Criar um `User(is_admin=True)` no seed com email conhecido (ex: `admin@admin.com`) |

## Migration Plan

1. Adicionar campo `is_admin` ao modelo User
2. Criar modelo FeatureFlag
3. Criar schemas e endpoints admin
4. Adicionar `require_admin` dependency
5. Adicionar `is_admin` ao JWT e responses de auth
6. Seed de flags + usuário admin
7. Criar FeatureFlagsContext no frontend
8. Criar AdminRoute + página Admin
9. Modificar Dashboard, HelpButton, LevelUp, Tutorial
10. Rodar testes

## Open Questions

- O seed deve criar um usuário admin padrão (ex: admin@admin.com / admin123)?
- As flags devem ser recriadas no seed se a tabela estiver vazia, ou sempre upsert?
