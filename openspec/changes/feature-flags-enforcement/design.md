## Context

O sistema de feature flags foi implementado no change `feature-flags-system`, mas com lacunas críticas:

1. **Backend não aplica as flags** — a rota `GET /api/modules` e `GET /api/modules/{id}/lessons` retornam todos os módulos/lições independentemente do estado das flags
2. **Componentes frontend não consultam as flags** — HelpButton, LevelUp e Tutorial foram listados no spec mas nunca implementaram a verificação
3. **Cache Redis nunca é invalidado** — o admin PATCH não limpa o cache `feature_flags:all`

Isso significa que desativar uma flag no admin é, na prática, um **display hint** sem enforcement real.

## Goals / Non-Goals

**Goals:**
- Backend `modules.py` filtra módulos/lições por feature flag
- HelpButton, LevelUp, Tutorial verificam flags antes de renderizar
- Admin PATCH invalida cache Redis
- Normalizar nomenclatura das keys para underscore

**Non-Goals:**
- Não altera o modelo `FeatureFlag` nem a estrutura de dados
- Não adiciona novas flags (apenas corrige o enforcement das existentes)
- Não implementa o comportamento "locked" (foi especificado mas nunca implementado — fora de escopo)

## Decisions

### Decisão 1: Backend filtra módulos no momento da listagem

O endpoint `GET /api/modules` deve:
1. Buscar todas as feature flags ativas
2. Filtrar os módulos cujo `module_type` corresponda a uma flag ativa
3. Retornar apenas os módulos permitidos

Para lições, o endpoint `GET /api/modules/{module_id}/lessons` deve verificar se o módulo está ativo antes de retornar as lições — caso contrário, retorna 404.

**Alternativa considerada:** Filtrar apenas no frontend. Rejeitada porque não impede acesso via URL direta.

### Decisão 2: Cache Redis invalidado no PATCH

O admin PATCH deve chamar `cache.delete("feature_flags:all")` após atualizar a flag. Isso garante que a próxima requisição `GET /feature-flags` busque do banco.

### Decisão 3: HelpButton, LevelUp, Tutorial consomem FeatureFlagsContext

Os três componentes devem importar `useFeatureFlags`, chamar `isActive(chave)` e retornar `null` / redirecionar se a flag estiver inativa.

## Risks / Trade-offs

- **Risco**: Filtrar módulos no backend pode quebrar a navegação se o admin desativar um módulo que alunos já estão usando. **Mitigação**: Alunos que já abriram a lição antes da flag ser desativada ainda têm acesso pela URL — o filtro só impede *novas* requisições.
- **Risco**: Cache Redis invalidation pode causar pico de queries no banco se muitas flags forem alteradas rapidamente. **Mitigação**: Aceitável — o volume de admins é baixo.
