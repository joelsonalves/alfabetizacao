## 1. Adicionar force backfill

- [x] 1.1 Adicionar função `backfill_lesson_images_force(db)` em `backend/app/services/backfill_lesson_images.py`
- [x] 1.2 Adicionar flag `--force` ao `main()` do script

## 2. Executar e verificar

- [x] 2.1 Rodar `docker compose exec backend python -m app.services.backfill_lesson_images --force`
- [x] 2.2 Verificar que a lição 113 (WA) agora mostra 🌐 em vez de 🐺
- [x] 2.3 Fazer commit da alteração
