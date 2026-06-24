## 1. Investigação e Auditoria

- [x] 1.1 Identificar os dados da lição 240 no banco de dados.
- [x] 1.2 Verificar o mapeamento atual de imagem/texto na base de dados para a lição 240.
- [x] 1.3 Auditar outras lições no módulo 6 para identificar inconsistências similares.

## 2. Correção — Lição 240 (pássaro vs pinguim)

- [x] 2.1 Adicionar "pássaro" ao `WORD_EMOJI_MAP` em `backend/app/services/images.py`.
- [x] 2.2 Corrigir testes de `unsplash` que falhavam por caminho de `patch` incorreto.

## 3. Correção — Lição 248 (cadeira em contexto inadequado)

- [x] 3.1 Expandir a lista de *stop words* em `backend/app/services/images.py` (função `get_emoji_for_text`) para incluir:
  - Pronomes possessivos: `meu`, `minha`, `meus`, `minhas`, `teu`, `tua`, `teus`, `tuas`, `seu`, `sua`, `seus`, `suas`, `nosso`, `nossa`, `nossos`, `nossas`
  - Verbos comuns: `é`, `são`, `tem`, `têm`
  - Outros: `com`, `para`, `por`
- [x] 3.2 Adicionar as mesmas *stop words* no mapeamento equivalente em `backend/app/services/seed.py` (função `get_lesson_image_fields`) — já coberto pelo uso de `get_emoji_for_text()` de images.py

## 4. Correção — Letra X (❌ inadequado)

- [x] 4.1 Alterar `EMOJI_MAP["X"]` em `backend/app/services/images.py` de `❌` para `☕` — já implementado
- [ ] 4.2 Executar backfill ("Re-resolver imagens" no admin) para propagar a correção para o banco.

## 5. Verificação

- [ ] 5.1 Executar `pytest` e confirmar todos os testes passando.
- [ ] 5.2 Validar visualmente as lições 240, 248 e a consoante X no frontend.
