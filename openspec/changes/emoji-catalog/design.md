## Context

O EmojiPicker do admin (`frontend/src/components/EmojiPicker/`) atualmente consulta `GET /admin/emoji-mappings`, que retorna apenas os emojis dos dicionários `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP` e `WORD_EMOJI_MAP` em `backend/app/services/images.py`. Professores que querem trocar a imagem de uma lição ficam restritos a esses ~150 emojis.

O catálogo proposto adiciona ~480 emojis em 8 categorias temáticas (Animais, Comida, Natureza, Objetos, Pessoas, Transporte, Ações, Formas/Cores), todos armazenados no backend e servidos pelo mesmo endpoint. O frontend ganha uma nova aba "Catálogo" com sub-abas e destaque visual para emojis já em uso.

## Goals / Non-Goals

**Goals:**
- Disponibilizar um catálogo amplo de emojis (~400+) para o admin escolher
- Organizar o catálogo em categorias reconhecíveis para educadores
- Destacar visualmente (⭐) emojis que já estão mapeados nos dicionários
- Manter compatibilidade total com a interface e API existentes
- Preservar o comportamento das abas atuais (Letras, Sílabas, Palavras, Frases)

**Non-Goals:**
- Não substituir os dicionários existentes — eles continuam sendo a fonte para seed/backfill automático
- Não adicionar busca por imagens externas (Unsplash, etc.) via catálogo
- Não modificar a tela de Lesson.jsx ou o comportamento de fallback de imagens
- Não permitir edição dos itens do catálogo via API (é somente leitura)

## Decisions

### 1. Catálogo no backend vs. frontend
- **Decisão:** Backend (`images.py`)
- **Alternativa considerada:** JSON estático no frontend
- **Racional:** Consistência com os dicionários existentes; o backend é a fonte única da verdade; o catálogo pode ser reutilizado por outras ferramentas admin futuras

### 2. Categorização plana vs. hierárquica
- **Decisão:** Categorias planas (lista de 8 categorias, cada uma com items)
- **Alternativa considerada:** Árvore de categorias com subcategorias
- **Racional:** 8 categorias é manejável numa única linha de abas; subcategorias adicionariam complexidade desnecessária de navegação

### 3. Emojis em uso destacados via flag `mapped`
- **Decisão:** O backend computa e retorna um booleano `mapped` para cada item do catálogo
- **Alternativa considerada:** Frontend fazer o merge local dos mapeamentos com o catálogo
- **Racional:** O backend já tem todos os dicionários carregados; evita duplicar lógica de verificação no frontend e garante consistência

### 4. Catálogo como array na resposta existente vs. endpoint separado
- **Decisão:** Campo `catalog` no mesmo `GET /admin/emoji-mappings`
- **Alternativa considerada:** `GET /admin/emoji-catalog` separado
- **Racional:** O EmojiPicker já chama o endpoint existente; adicionar o campo evita uma requisição extra e simplifica o frontend. O endpoint continua sendo admin-only

## Risks / Trade-offs

- **Tamanho da resposta:** O catálogo adiciona ~480 itens à resposta JSON (~15-20 KB). Risco baixo — é uma chamada admin ocasional, não crítica de performance
- **Manutenção do catálogo:** Adicionar/remover emojis exige editar o Python dict. Mitigação: o catálogo é um dicionário bem comentado e agrupado por categoria, facilitando edição manual
- **Sobreposição com dicionários:** Emojis como 🐝 (abelha) aparecem tanto no mapeamento da letra A quanto no catálogo (Animais). Mitigação: a flag `mapped: true` evita duplicidade visual e informa o usuário
- **Caracteres Unicode:** Alguns emojis podem não renderizar em browsers antigos. Mitigação: usamos apenas emojis Unicode 12+ bem estabelecidos

## Open Questions

- A busca textual no campo 🔍 deve pesquisar também dentro do catálogo (além das abas atuais)? **Decisão:** Sim — a busca já filtra `currentItems`, que mudam conforme a aba ativa. A busca no catálogo funcionará naturalmente.
