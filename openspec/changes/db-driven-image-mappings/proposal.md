## Why

Atualmente, os mapeamentos de texto para emoji/imagem estão **duplicados e fragmentados**:

1. **`backend/app/services/images.py`** — dicionários hardcoded (`EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, `WORD_EMOJI_MAP`) usados em runtime.
2. **`backend/app/services/seed.py`** — cópias *quase idênticas* dos mesmos dicionários para popular os dados iniciais.
3. **Banco de dados** — o campo `lessons.image_url` já existe, mas **não é populado** para frases e orações, ficando `null`.
4. **Admin** — o formulário de edição de lições (`/admin?tab=content`) **não exibe** os campos de imagem, impossibilitando a troca via interface.

Isso significa que para corrigir a imagem de uma lição, é necessário:
- Editar código Python, rodar seed, reiniciar servidor.
- Ou modificar diretamente no banco via SQL.

**O que o usuário precisa**: que as imagens sejam gerenciáveis via banco de dados e editáveis pela interface de administração, sem tocar em código.

## What Changes

1. **Seed atualizado**: `get_lesson_image_fields()` passa a resolver `image_url` para **todos os tipos de lição**, importando as funções de `images.py` em vez de duplicar os dicionários.
2. **Backfill de lições existentes**: Script/service que percorre todas as lições no banco e popula `image_url` onde estiver `null`, usando a mesma lógica de `images.py`.
3. **Admin UI completa**: O formulário de edição/criação de lições na aba "Conteúdo" passa a incluir `image_url`, `image_active`, `alt_text`, `placeholder_text`.
4. **Seletor visual de emojis**: Uma galeria modal que exibe todos os emojis disponíveis (letras, sílabas, palavras, frases), permitindo seleção visual em vez de digitação manual.
5. **Simplificação do Lesson.jsx**: Cadeia de fallback mantida como rede de segurança, com `image_url` como fonte primária.

## Capabilities

### New Capabilities
- `lesson-image-storage`: Armazenamento e resolução de mapeamentos imagem-texto no banco de dados.
- `emoji-picker`: Seletor visual de emojis para o admin.

### Modified Capabilities
- `lesson-image-mapping`: O seed passa a usar a mesma lógica de resolução de `images.py`.

## Impact

- **`backend/app/services/images.py`**: Sem alterações estruturais (continua sendo a fonte da lógica de resolução).
- **`backend/app/services/seed.py`**: Importa e usa funções de `images.py` em vez de duplicar dicionários.
- **`backend/app/routes/admin_content.py`**: Nova rota `GET /admin/emoji-mappings`.
- **`backend/app/`**: Novo script `backfill_lesson_images.py` para popular lições existentes.
- **`frontend/src/pages/Admin.jsx`**: `ContentTab` ganha campos de imagem no formulário.
- **`frontend/src/components/EmojiPicker/`**: Novo componente de seletor visual de emojis.
- **`frontend/src/pages/Lesson.jsx`**: Fallback mantido, `image_active` respeitado.
