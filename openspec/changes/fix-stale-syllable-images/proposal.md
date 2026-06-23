## Why

O `image_url` das lições é calculado no seed/backfill com base nos dicionários de `images.py` (`EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, etc.) e armazenado no banco. Quando um desses dicionários é alterado (ex: `EMOJI_MAP["W"]` mudou de 🐺 para 🌐), as lições existentes no banco **mantêm o valor antigo** porque o backfill só preenche `NULL`. Isso faz com que sílabas como "WA" (sem entrada própria em `SYLLABLE_EMOJI_MAP`, caindo no fallback da letra) mostrem um emoji desatualizado — 🐺 em vez de 🌐.

## What Changes

1. **`backend/app/services/backfill_lesson_images.py`**: Adicionar função `backfill_lesson_images_force(db)` que recalcula `image_url` de **todas** as lições, não apenas das que estão `NULL`. Só atualiza se o valor resolvido diferir do armazenado (preserva edições manuais do admin).
2. Adicionar flag `--force` ao `main()` do script para executar o modo force via CLI.
3. Executar o force backfill para corrigir as imagens desatualizadas no banco.

## Capabilities

### New Capabilities
*Nenhuma — correção interna, sem nova capacidade.*

### Modified Capabilities
*Nenhuma — o comportamento das APIs e schemas permanece idêntico.*

## Impact

- **`backend/app/services/backfill_lesson_images.py`**: Adicionada `backfill_lesson_images_force()`. A função existente `backfill_lesson_images()` não é alterada.
- **Banco de dados**: Lições com `image_url` desatualizado serão atualizadas após execução do script.
- Nenhuma alteração em rotas, schemas, modelos ou frontend.
