## 1. Backend: Migração e modelo

- [ ] 1.1 Criar migration Alembic: add `active`, `image_url`, `image_active`, `alt_text`, `placeholder_text` à tabela `lessons`
- [ ] 1.2 Copiar dados de `lesson_images` para `lessons` e definir defaults para registros existentes
- [ ] 1.3 Dropar tabela `lesson_images`
- [ ] 1.4 Remover `LessonImage` do código (`models/__init__.py`, imports)
- [ ] 1.5 Atualizar `LessonResponse` schema com novos campos
- [ ] 1.6 Criar `LessonCreate`, `LessonUpdate`, `ModuleCreate`, `ModuleUpdate` schemas

## 2. Backend: Endpoints admin

- [ ] 2.1 Criar `app/routes/admin_content.py` com CRUD de módulos (GET/POST/PATCH/DELETE)
- [ ] 2.2 Adicionar CRUD de lessons (GET/POST/PATCH/DELETE) em `admin_content.py`
- [ ] 2.3 Registrar router em `app/main.py`
- [ ] 2.4 Atualizar `GET /modules/{module_id}/lessons` para filtrar `active = True`
- [ ] 2.5 Garantir que `GET /lessons/{id}` retorne todos os novos campos

## 3. Backend: Seed

- [ ] 3.1 Atualizar `seed.py` para definir `active = True`, `image_active = True`, `alt_text`, `placeholder_text` para todas as lessons
- [ ] 3.2 Mover dados de emoji de `images.py` para o seed (armazenar na DB como lesson com image_url)

## 4. Frontend: Admin tab navigation

- [ ] 4.1 Adicionar navegação por abas em `Admin.jsx` (Flags | Módulos | Conteúdo)
- [ ] 4.2 Aba Módulos: listar, criar, editar, deletar LearningModules
- [ ] 4.3 Aba Conteúdo: seletor de módulo, tabela de lessons, toggle inline
- [ ] 4.4 Aba Conteúdo: formulário de criação/edição de lesson (inline expand ou modal)
- [ ] 4.5 Aba Conteúdo: confirmação de exclusão

## 5. Frontend: Métodos api.js

- [ ] 5.1 Adicionar `admin.listLessons(moduleId?)`, `admin.createLesson()`, `admin.updateLesson()`, `admin.deleteLesson()`
- [ ] 5.2 Adicionar `admin.listModules()`, `admin.createModule()`, `admin.updateModule()`, `admin.deleteModule()`

## 6. Frontend: Lesson player

- [ ] 6.1 Atualizar `Lesson.jsx` para usar `image_url`, `alt_text`, `placeholder_text` da API
- [ ] 6.2 Atualizar `ImageDisplay.jsx` com props `url`, `alt`, `active`, `fallback`, `placeholder`
- [ ] 6.3 Adicionar redirect em `Lesson.jsx` se `active === false`
- [ ] 6.4 Remover ou adaptar chamadas a `api.images.emoji()` / `api.images.word()` (agora os dados vêm da lesson)

## 7. Testes

- [ ] 7.1 Rodar `pytest` e confirmar todos os testes passando
- [ ] 7.2 Rodar `npm test` e confirmar todos os testes passando
- [ ] 7.3 Testar manualmente: CRUD completo via admin, verificar alterações no Dashboard/Lesson
