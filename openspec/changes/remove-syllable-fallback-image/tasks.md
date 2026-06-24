## 1. Remover Fallback de Sílaba

- [x] 1.1 Substituir `return get_emoji_for_letter(key[0])` por `return None` em `get_emoji_for_syllable()` em `backend/app/services/images.py`
- [x] 1.2 Executar `backfill_lesson_images_force()` para limpar `image_url` de lições WA, WE, WI, WO, WU — executado com `--force` (81 lessons atualizadas)
- [x] 1.3 Verificar lição 113 (WA) — `image_url` deve ser `null` — coberto pelo backfill force

## 2. Commits e Finalização

- [x] 2.1 Commit da alteração em `images.py`
- [x] 2.2 Push para o GitHub
