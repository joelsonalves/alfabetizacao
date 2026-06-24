## 1. Modelo e Migração

- [x] 1.1 Adicionar campo `image_policy: str` à classe `Lesson` em `backend/app/models/module.py` com `nullable=False`, `default="auto"`
- [x] 1.2 Criar migration Alembic para adicionar coluna `image_policy` à tabela `lessons`
- [x] 1.3 Implementar lógica de migração para popular `image_policy` das lições existentes (heurística: `image_active=false` → "none", senão "auto")

## 2. Backend — Admin Routes

- [x] 2.1 Atualizar schema Pydantic de criação/edição de lições em `admin_content.py` para aceitar `image_policy` (validando valores permitidos)
- [x] 2.2 Atualizar endpoints POST/PATCH `/admin/lessons` para persistir `image_policy`
- [x] 2.3 Atualizar GET `/admin/lessons` para retornar `image_policy` no response

## 3. Backend — Backfill

- [x] 3.1 Em `backfill_lesson_images_force()`: pular lições com `image_policy != "auto"`
- [x] 3.2 Em `backfill_lesson_images()` (preenche NULLs): pular lições com `image_policy != "auto"`

## 4. Backend — Seed

- [x] 4.1 Em `seed.py`: definir `image_policy="auto"` nas lições criadas

## 5. Frontend — Admin

- [x] 5.1 Substituir checkbox `image_active` por seletor de política (radio group ou select) com opções Auto / Nenhuma / Personalizada
- [x] 5.2 Garantir que o seletor persista `image_policy` e não mais `image_active` no submit

## 6. Frontend — Exibição da Lição

- [x] 6.1 Atualizar `Lesson.jsx` para consultar `image_policy`:
  - `"auto"`: comportamento atual (image_url → live-resolve)
  - `"none"`: não exibir imagem, não live-resolve, mostrar placeholder_text
  - `"custom"`: exibir image_url, não live-resolve se null
- [x] 6.2 Remover lógica antiga de `image_active` na exibição (ou adaptá-la para compatibilidade)

## 7. Verificação

- [ ] 7.1 Testar criação de lição com cada política no admin
- [ ] 7.2 Verificar que lição com `image_policy="none"` não exibe imagem nem faz live-resolve
- [ ] 7.3 Verificar que backfill não altera lições com `image_policy != "auto"`
- [ ] 7.4 Verificar que lições existentes recebem `image_policy` correto após migração
