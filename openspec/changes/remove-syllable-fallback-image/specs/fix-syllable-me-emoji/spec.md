# Fix: Associação da Sílaba "ME" — 🪑 → 🍉 — Remoção de Fallback para Letra

## MODIFIED Requirements

### Requirement: get_emoji_for_syllable retorna None para sílabas sem entrada

`get_emoji_for_syllable(key)` NÃO DEVE fazer fallback para `get_emoji_for_letter(key[0])` quando a sílaba não existe em `SYLLABLE_EMOJI_MAP`. DEVE retornar `None`.

```python
def get_emoji_for_syllable(key: str) -> str | None:
    if key in SYLLABLE_EMOJI_MAP:
        return SYLLABLE_EMOJI_MAP[key]
    return None  # Não fazer fallback para get_emoji_for_letter(key[0])
```

**Motivação:** Sílabas sem entrada em `SYLLABLE_EMOJI_MAP` (ex: WA, WE, WI, WO, WU) não devem exibir emoji algum. O fallback para a letra inicial criava falsos positivos fonéticos — "WA" exibia o emoji de "W" (🌐 globo), que não corresponde à sílaba.

**Comportamento anterior:**
```python
def get_emoji_for_syllable(key: str) -> str | None:
    if key in SYLLABLE_EMOJI_MAP:
        return SYLLABLE_EMOJI_MAP[key]
    return get_emoji_for_letter(key[0])  # ❌ removido
```

#### Scenario: Sílaba sem entrada retorna None

- **GIVEN** a sílaba "WA" (ou qualquer outra sem entrada em `SYLLABLE_EMOJI_MAP`)
- **WHEN** `get_emoji_for_syllable("WA")` é chamada
- **THEN** DEVE retornar `None`
- **AND** NÃO DEVE retornar `get_emoji_for_letter("W")` (🌐 globo)

#### Scenario: Sílaba com entrada mantém comportamento

- **GIVEN** a sílaba "MA" com entrada em `SYLLABLE_EMOJI_MAP: "🤚"`
- **WHEN** `get_emoji_for_syllable("MA")` é chamada
- **THEN** DEVE retornar `"🤚"` (comportamento inalterado)

#### Scenario: Backfill limpa image_url obsoleto

- **GIVEN** uma lição com `lesson_type="syllable"` e `target="WA"` que possui `image_url="🌐"` (fallback antigo)
- **WHEN** `backfill_lesson_images_force()` é executada
- **THEN** a lição DEVE ter `image_url` atualizado para `None`
- **AND** a lição NÃO DEVE mais exibir emoji de globo

## REMOVED Requirements

### Requirement: Fallback de sílaba para letra inicial

**Reason:** Fallback removido por produzir falsos positivos fonéticos. Sílabas sem entrada em `SYLLABLE_EMOJI_MAP` agora retornam `None` em vez de usar o emoji da primeira letra.

**Migration:** Nenhuma ação necessária. O banco de dados pode conter `image_url` obsoleto — executar `backfill_lesson_images_force()` para limpar.
