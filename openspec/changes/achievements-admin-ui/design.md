## Context

O backend já expõe 4 endpoints admin para achievement definitions em `routes/config.py`:
- `GET /api/admin/achievements` — lista todas as definições (com cache Redis)
- `POST /api/admin/achievements` — cria nova definição
- `PUT /api/admin/achievements/{achievement_type}` — atualiza definição
- `DELETE /api/admin/achievements/{achievement_type}` — remove definição

O Admin.jsx atual tem 3 abas (Flags, Módulos, Conteúdo) usando o padrão de tabs com `useSearchParams`. Cada aba é um componente separado. O padrão para CRUD é: tabela com edição inline + formulário de criação em painel expansível.

## Goals / Non-Goals

**Goals:**
- Adicionar aba "Conquistas" no admin com listagem de definições
- Permitir criar, editar e excluir definições via UI
- Seguir o mesmo padrão visual das abas existentes (tabela, toggle-switch para active, botões Editar/Excluir)

**Non-Goals:**
- Não alterar o backend (endpoints já existem)
- Não implementar upload de ícone personalizado (apenas emoji text)
- Não gerenciar conquistas de usuários individuais

## Decisions

| Decisão | Opção | Alternativa | Motivo |
|---------|-------|-------------|--------|
| Padrão de UI | Tabela com edição inline (mesmo de Módulos) | Modal separado | Consistência com as abas existentes; código reutiliza padrões |
| Chave de edição | `achievement_type` (string, única) | `id` | O backend usa `achievement_type` como path param no PUT/DELETE |
| Campos editáveis | name, description, icon, active | Apenas name/active | O admin precisa controlar todos os campos de apresentação |
| Cache | Invalidação automática via backend | — | Backend já faz `cache.delete("achievements:all")` no POST/PUT/DELETE |

## Risks / Trade-offs

- **[Chave única]**: `achievement_type` é a chave usada para PUT/DELETE. Se o admin alterar o type, a URL de update muda. → O campo `achievement_type` NÃO deve ser editável após criação (igual ao backend que não permite alterar type no PUT)
- **[Sem confirmação]**: A exclusão de definição NÃO remove conquistas já desbloqueadas por usuários (não há FK). A conquista continua existindo na tabela `achievements` mas perde a referência de definição. → Adicionar confirmação na exclusão
