# Database Migration Safety

Especificação do procedimento de aplicação segura de migrations no banco PostgreSQL, usando o caso concreto da coluna `association_word` na tabela `lessons`.

## Contexto

O modelo SQLAlchemy `Lesson` em `backend/app/models/module.py` declara `association_word = Column(String(100), nullable=True)`. Essa declaração faz com que toda query `SELECT * FROM lessons` inclua a coluna `association_word`. Se a coluna não existir no banco de dados (migration não aplicada), o PostgreSQL retorna erro `column lessons.association_word does not exist` e **todas as queries de lição quebram** — 100% das lições deixam de abrir.

## Problema

- A migration `0005_add_association_word.py` existe no repositório
- O modelo e schemas já referenciam `association_word`
- O container Docker do backend executa `alembic upgrade head` **apenas na inicialização**
- Se o container não foi reiniciado após a criação da migration, a coluna não existe no banco
- O backend em produção (ou desenvolvimento) fica inacessível para qualquer rota que retorne `Lesson`

## Solução

Duas abordagens possíveis, documentadas como estratégias alternativas:

---

## ADDED Requirements

### Requirement: Coluna association_word na tabela lessons

O banco de dados DEVE ter a coluna `association_word VARCHAR(100) nullable` na tabela `lessons`.

#### Scenario: Migration aplicada com sucesso

- **WHEN** o comando `alembic upgrade head` é executado
- **THEN** a tabela `lessons` DEVE conter a coluna `association_word VARCHAR(100) nullable`
- **AND** o comando `alembic current` DEVE listar `0005` como revisão atual

#### Scenario: Rollback da migration

- **WHEN** o comando `alembic downgrade -1` é executado
- **THEN** a coluna `association_word` DEVE ser removida da tabela `lessons`
- **AND** o comando `alembic current` DEVE listar `77b10cc16541` como revisão atual

---

### Requirement: Aplicação da migration via Docker Compose

O arquivo `docker-compose.yml` já define o comando de inicialização do backend como `alembic upgrade head && uvicorn ...`. Portanto, a migration é aplicada automaticamente ao reiniciar o container.

#### Scenario: Container reiniciado

- **WHEN** o comando `docker compose restart backend` é executado
- **THEN** o container executa `alembic upgrade head` durante a inicialização
- **AND** a coluna `association_word` é criada no banco
- **AND** o endpoint `GET /api/modules/{id}/lessons` retorna 200 com a lista de lições

#### Scenario: Verificação pós-reinício

- **WHEN** o container está rodando
- **AND** o comando `docker compose exec backend alembic current` é executado
- **THEN** a saída DEVE incluir `0005` como revisão atual

---

### Requirement: Backfill de association_word para lições existentes

Lições criadas antes da migration têm `association_word = NULL`. O script `backfill_association_words()` em `backend/app/services/backfill_lesson_images.py` DEVE preencher essas lições.

#### Scenario: Backfill executado no container

- **WHEN** o comando abaixo é executado no container backend:
  ```bash
  docker compose exec backend python3 -c "
  from app.database import SessionLocal
  from app.services.backfill_lesson_images import backfill_association_words
  db = SessionLocal()
  count = backfill_association_words(db)
  print(f'{count} lições atualizadas.')
  db.close()
  "
  ```
- **THEN** `count` DEVE ser igual ao número de lições dos tipos `letter` e `consonant` que existem no banco
- **AND** cada lição desses tipos DEVE ter `association_word` preenchido com o valor de `LETTER_ASSOCIATION` em `images.py`

#### Scenario: Backfill não sobrescreve valores existentes

- **GIVEN** uma lição com `association_word = 'web'` (definido manualmente via admin)
- **WHEN** `backfill_association_words()` é executado
- **THEN** o valor `'web'` NÃO DEVE ser sobrescrito
- **REASON** a query do backfill filtra por `Lesson.association_word.is_(None)`

---

### Requirement: Verificação de que lições funcionam

Após a migration e backfill, o frontend DEVE carregar lições sem erro.

#### Scenario: Lição carrega com association_word do banco

- **WHEN** o usuário acessa qualquer lição do tipo `letter` ou `consonant`
- **THEN** a lição DEVE abrir sem erros no console
- **AND** o texto exibido DEVE refletir o valor de `association_word` do banco
- **AND** se `association_word` for nulo, DEVE usar `LETTER_WORDS` como fallback

---

### Requirement: Consistência entre LETTER_ASSOCIATION e EMOJI_MAP

O dicionário `LETTER_ASSOCIATION` em `backend/app/services/images.py` DEVE estar alinhado com `EMOJI_MAP` para as 26 letras.

#### Scenario: W → web

- **WHEN** `get_association_for_letter("W")` é chamado
- **THEN** DEVE retornar `"web"`
- **AND** `EMOJI_MAP["W"]` DEVE ser `"🌐"` (globo, associado a "web")

#### Scenario: X → xícara

- **WHEN** `get_association_for_letter("X")` é chamado
- **THEN** DEVE retornar `"xícara"`
- **AND** `EMOJI_MAP["X"]` DEVE ser `"☕"` (xícara de café)

---

## Procedimento Operacional Padrão (SOP)

### Passo 1: Aplicar a migration

```bash
# Opção A: Via Docker Compose (recomendado)
docker compose restart backend

# Opção B: Manual (se tiver acesso direto ao banco)
cd backend && source .venv/bin/activate && alembic upgrade head
```

### Passo 2: Verificar a migration

```bash
docker compose exec backend alembic current
# Saída esperada: 0005 (head)
```

### Passo 3: Executar o backfill

```bash
docker compose exec backend python3 -c "
from app.database import SessionLocal
from app.services.backfill_lesson_images import backfill_association_words
db = SessionLocal()
count = backfill_association_words(db)
print(f'{count} lições atualizadas.')
db.close()
"
```

### Passo 4: Verificar

- Abrir o frontend e navegar até uma lição
- Verificar se carrega sem erros
- Verificar o console do navegador (F12) — nenhum erro de rede 500

### Passo 5: (Opcional) Editar palavra no admin

- Acessar `/admin`
- Editar uma lição (ex: letra W, lição 2/24)
- Definir "Palavra Associada" = "web"
- Salvar

---

## Rollback

Caso algo dê errado:

```bash
# Reverter a migration
docker compose exec backend alembic downgrade -1

# Ou reiniciar sem a migration (se o modelo ainda tiver a coluna comentada)
# 1. Comentar association_word no modelo module.py
# 2. Remover association_word de LessonResponse em schemas/module.py
# 3. Reiniciar o backend
docker compose restart backend
```
