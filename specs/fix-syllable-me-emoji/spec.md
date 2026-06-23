# Fix: Associação da Sílaba "ME" — 🪑 → 🍉

Corrigir o emoji da sílaba "ME" no `SYLLABLE_EMOJI_MAP`, substituindo a cadeira (🪑) por melancia (🍉), cujo nome em português **começa com "ME"**, garantindo coerência fonética com a sílaba ensinada.

---

## Problema

### Incongruência Fonética

A lição `/lesson/3/74` (sílaba **ME**, módulo 3 — Sílabas Simples) exibe o emoji 🪑 (**cadeira**). A palavra "cadeira" **não começa com "ME"** — começa com "CA". Isso quebra o princípio pedagógico fundamental de associar a sílaba aprendida a uma palavra que **comece com o mesmo som**.

| Sílaba | Emoji atual | Palavra associada | Primeira sílaba | Coerente? |
|--------|------------|-------------------|----------------|-----------|
| ME | 🪑 | "cadeira" | CA | ❌ |
| ME | 🍉 | "melancia" | ME | ✅ |

### Causa Raiz

O dicionário `SYLLABLE_EMOJI_MAP` em `backend/app/services/images.py` linha 46 foi povoado com valores que priorizaram a disponibilidade do emoji no catálogo sem verificar se a palavra em português correspondente começa com a sílaba correta.

```python
# Atual (incorreto):
"ME": "🪑",  # cadeira — não começa com ME

# Correto:
"ME": "🍉",  # melancia — começa com ME
```

### Escopo

Esta spec cobre **apenas** a sílaba "ME". O restante do `SYLLABLE_EMOJI_MAP` pode conter casos semelhantes, mas estão fora do escopo desta correção.

---

## Solução

### Alteração no Código

**Arquivo:** `backend/app/services/images.py`, linha 46

| De | Para |
|---|---|
| `"MA": "🤚", "ME": "🪑", "MI": "🌽", ...` | `"MA": "🤚", "ME": "🍉", "MI": "🌽", ...` |

### Impacto em Runtime

A função `get_emoji_for_syllable(key)` (linha 720-722) consulta `SYLLABLE_EMOJI_MAP` diretamente:

```python
def get_emoji_for_syllable(key: str) -> str | None:
    if key in SYLLABLE_EMOJI_MAP:
        return SYLLABLE_EMOJI_MAP[key]
    return None
```

Com a alteração, `get_emoji_for_syllable("ME")` passa a retornar `"🍉"` em vez de `"🪑"`.

### Impacto no Seed

A função `get_lesson_image_fields("syllable", target)` em `seed.py` (linha 80-82) chama `get_emoji_for_syllable(target)`. Portanto, **futuros seeds já usarão o emoji correto** automaticamente. **Nenhuma migração de banco é necessária** — a associação é computada em runtime, não armazenada no BD (os campos `image_url` no banco são populados pelo seed e podem ser sobrescritos via admin).

---

## Added Requirements

### Requirement: SYLLABLE_EMOJI_MAP.ME deve ser melancia

`backend/app/services/images.py` DEVE mapear `"ME": "🍉"` em `SYLLABLE_EMOJI_MAP`.

#### Scenario: get_emoji_for_syllable("ME") retorna melancia

- **GIVEN** o dicionário `SYLLABLE_EMOJI_MAP` com `"ME": "🍉"`
- **WHEN** `get_emoji_for_syllable("ME")` é chamada
- **THEN** DEVE retornar `"🍉"`
- **AND** NÃO DEVE retornar `"🪑"`

#### Scenario: Lição ME exibe melancia (comportamento integrado)

- **GIVEN** a lição com `target="ME"` e `lesson_type="syllable"`
- **WHEN** `get_lesson_image_fields("syllable", "ME")` é chamada
- **THEN** `image_url` DEVE ser `"🍉"`
- **AND** `alt_text` DEVE ser `"Emoji da sílaba ME"`

### Requirement: Nenhuma regressão nas demais sílabas

As demais entradas de `SYLLABLE_EMOJI_MAP` NÃO DEVEM ser alteradas.

#### Scenario: Demais sílabas mantêm seus emojis

- **GIVEN** o dicionário `SYLLABLE_EMOJI_MAP` inalterado exceto por `"ME"`
- **WHEN** `get_emoji_for_syllable(s)` é chamada para cada sílaba `s` em `SYLLABLE_EMOJI_MAP`
- **THEN** DEVE retornar o mesmo valor de antes da alteração

---

## Verificação

### Teste Automatizado (opcional, recomendado)

```python
# tests/test_syllable_emoji.py
def test_me_syllable_is_melancia():
    from app.services.images import get_emoji_for_syllable
    assert get_emoji_for_syllable("ME") == "🍉"
    assert get_emoji_for_syllable("ME") != "🪑"
```

### Verificação Manual

1. Acessar `http://localhost:5173/lesson/3/74`
2. Verificar que o emoji exibido é 🍉 (melancia), não 🪑 (cadeira)
3. Navegar por outras lições de sílabas (ex: `/lesson/3/73` = MA, `/lesson/3/75` = MI) e confirmar que os emojis não foram alterados

---

## Arquivos Afetados

| Arquivo | Ação | Risco |
|---|---|---|
| `backend/app/services/images.py:46` | Alterar `"ME": "🪑"` → `"ME": "🍉"` | Baixo — mudança de 1 caractere |
| `tests/test_syllable_emoji.py` | Criar (opcional) | Nenhum |

**Nenhum arquivo de frontend, banco de dados ou migração é afetado.**

---

## Notas

- Esta correção poderia ter sido evitada se a validação de `SYLLABLE_EMOJI_MAP` verificasse que a palavra associada ao emoji começa com a sílaba correta. Isso pode ser automatizado futuramente com um teste de auditoria.
- O `fix-lesson-image-mismatch` (`openspec/changes/fix-lesson-image-mismatch/`) já havia identificado o problema genérico de falsos positivos no fallback de `get_emoji_for_text`. Esta spec é uma correção pontual e independente.
