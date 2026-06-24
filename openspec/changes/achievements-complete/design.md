## Context

O sistema de conquistas atualmente possui:

- **Tabelas**: `achievements` (conquistas do usuário) e `achievement_definitions` (catálogo) — ambas com migrations
- **Endpoints**: CRUD admin de definições (`/api/admin/achievements`), listagem e desbloqueio de conquistas do usuário (`GET/POST /api/progress/achievements`)
- **Seed**: 8 definições com type, name, description, icon emoji
- **Frontend**: Profile.jsx busca conquistas do usuário mas exibe raw `achievement_type` em vez do nome, e ícone `🏅` fixo

O que falta:
1. Perfil não busca definitions para resolver nome/ícone/descrição
2. Nenhuma conquista é auto-desbloqueada durante o uso
3. Seed não é executado no startup
4. Frontend não tem endpoint público para definitions

## Goals / Non-Goals

**Goals:**
- Profile exibe conquistas com nome, ícone, descrição e data corretos
- Conquistas são desbloqueadas automaticamente ao completar lições (first_lesson, no_errors, score_100, all_vowels, all_consonants)
- Seed de definições executado automaticamente no startup
- Endpoint público GET /api/achievement-definitions disponível

**Non-Goals:**
- Não implementar UI admin de conquistas (CRUD já existe via endpoints, frontend fica para outro change)
- Não implementar notificações/toast ao desbloquear (fica para change futuro)
- Não implementar streak tracking (streak_3/7/30) — requer lógica de datas que ainda não existe no backend
- Não modificar esquemas ou migrations existentes

## Decisions

| Decisão | Opção | Alternativa | Motivo |
|---------|-------|-------------|--------|
| Onde disparar auto-unlock | Dentro do endpoint `POST /api/progress/lesson/{id}` após `apply_progress_update` | Serviço separado com eventos/fila | Simplicidade: sem dependências externas, sem fila, sem latência extra. O endpoint já é o chokepoint natural |
| Como verificar conquistas por módulo | Query agregada: contar lições completas do módulo vs total de lições ativas | Cache pré-computado | Poucas lições por módulo (<20), query é rápida e simples |
| Definitions API | Novo arquivo `routes/achievements.py` com router separado | Inline em `routes/progress.py` | Separação de responsabilidade; facilita manutenção |
| Seed automático | `seed_all()` chamado no lifespan event do FastAPI | CLI separada | Garante que definições existem em qualquer ambiente sem passo manual |
| Resolução nome/ícone no frontend | Profile.jsx faz 2 chamadas: definitions + user achievements, e faz merge | Backend já retornar nome/ícone junto | Backend teria que mudar schema existente; frontend merge é simples e não quebra nada |

## Risks / Trade-offs

- **[Auto-unlock inline]**: Se houver muitas regras de conquista no futuro, o endpoint de progresso pode ficar pesado. → Mitigação: cada verificação é uma query agregada simples; se necessário, migrar para worker assíncrono depois
- **[Streak não implementado]**: As conquistas `streak_3/7/30` continuarão sem ser desbloqueadas. → Mitigação: o endpoint existe, pode ser chamado manualmente ou em change futuro com lógica de streak
- **[Seed duplicado]**: `seed_all` usa `get-or-create`, então executar múltiplas vezes é idempotente
