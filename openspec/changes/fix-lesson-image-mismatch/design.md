## Context

Duas lições foram reportadas com divergência entre texto e imagem:
1. Lição `/lesson/6/240` (frase: "O PÁSSARO CANTA ALTO") — exibia pinguim em vez de pássaro.
2. Lição `/lesson/7/248` (frase não identificada, mas com palavra iniciando em "ME") — exibia cadeira em vez do contexto correto.

**Causa Raiz (ambas):** A função `get_emoji_for_text` em `backend/app/services/images.py` possui uma lógica de *fallback* que, ao não encontrar uma palavra no `WORD_EMOJI_MAP`, tenta as duas primeiras letras como sílaba no `SYLLABLE_EMOJI_MAP`. Isso gera falsos positivos:
- "PÁSSARO" → "P" (letra) → 🐧 (pinguim)
- "MEU" / "MESA" / "MENINO" → "ME" (sílaba) → 🪑 (cadeira)

## Goals / Non-Goals

**Goals:**
- Corrigir o mapeamento de imagem/texto nas lições 240 e 248.
- Expandir a lista de *stop words* em `get_emoji_for_text` para evitar falsos positivos com pronomes possessivos e verbos comuns.
- Tornar o *fallback* mais robusto para frases e sentenças.

**Non-Goals:**
- Implementar uma nova biblioteca de imagens.
- Reescrever completamente o algoritmo de *fallback*.

## Decisions

- **Stop Words**: Adicionar à lista de *stop words* em `get_emoji_for_text` os pronomes possessivos (`meu`, `minha`, `seu`, `sua`, `nosso`, etc.), o verbo "é" e outros (`são`, `tem`, `com`, `para`, `por`). Essas palavras são genéricas e não devem influenciar a escolha do emoji.
- **Mapeamento Direto**: Adicionar "pássaro" e a frase "meu gato é preto" ao `WORD_EMOJI_MAP` em `backend/app/services/images.py` para resolução imediata.
- **Consistência**: Atualizar também `backend/app/services/seed.py` com os mesmos mapeamentos para garantir que futuros *seeds* já nasçam corretos.

## Risks / Trade-offs

- [Risco] Expansão excessiva de *stop words* pode ignorar palavras que de fato deveriam definir o emoji. → [Mitigação] Manter a lista enxuta, focada em pronomes possessivos e verbos de ligação, que são semanticamente pobres para identificação de contexto visual.
- [Risco] Alterar o *seed* não afeta dados já existentes no banco, apenas futuras inicializações. → [Mitigação] Focar a correção no `images.py` (runtime), que é o arquivo efetivamente consultado durante a execução.
