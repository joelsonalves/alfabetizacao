# Auditoria de Alinhamento: Sílabas × Emojis

Verificação sistemática de todas as 119 entradas em `SYLLABLE_EMOJI_MAP` (`backend/app/services/images.py`) para garantir que o label em português do emoji no `EMOJI_CATALOG` **começa com a sílaba mapeada**.

---

## Fase 1: Sílabas Simples (CV) — 89 entradas

### Problema

Das 89 sílabas simples (consoante + vogal), **55** estão corretas, **20** têm emoji cujo label não começa com a sílaba, e **14** usam emojis que sequer existem no `EMOJI_CATALOG`.

Isso significa que:
- 22% das sílabas simples exibem uma imagem foneticamente incoerente
- 16% dos emojis não aparecem no seletor do admin (não estão no catálogo)

### Solução

Corrigir em duas frentes:
1. **Renomear labels** no `EMOJI_CATALOG` — mesmo emoji, label mais adequado (ex: 🎀 "Laço" → "Fita")
2. **Trocar emojis** no `SYLLABLE_EMOJI_MAP` quando não houver label que comece com a sílaba
3. **Adicionar ao catálogo** os 19 emojis ausentes

#### Added Requirements

##### Requirement: BU deve usar emoji que comece com BU

`SYLLABLE_EMOJI_MAP["BU"]` NÃO DEVE usar 🐴 "Cavalo". DEVE usar 🐃 "Búfalo" (BÚ) ou 🐴 renomeado para "Burro".

##### Scenario: BU exibe emoji coerente

- **GIVEN** `SYLLABLE_EMOJI_MAP["BU"]` retorna um emoji
- **WHEN** busco o label desse emoji no `EMOJI_CATALOG`
- **THEN** a primeira palavra do label DEVE começar com "bu" (ex: "Burro", "Búfalo")
- **AND** NÃO DEVE ser "Cavalo"

##### Requirement: CE deve usar label que comece com CE

`SYLLABLE_EMOJI_MAP["CE"]` usa 🌤️ cujo label "Sol com nuvem" não começa com CE. DEVE ser substituído ou o emoji trocado.

**Nota:** Não há atualmente no catálogo nenhum item começando com "Ce". Sugere-se adicionar "Cereja" 🍒 (já existe no catálogo mas como "Cereja") — CE ✅.

##### Scenario: CE exibe emoji coerente

- **GIVEN** `get_emoji_for_syllable("CE")` é chamada
- **WHEN** o emoji retornado é verificado no `EMOJI_CATALOG`
- **THEN** DEVE existir um label que comece com "ce"
- **AND** NÃO DEVE ser "Sol com nuvem"

##### Requirement: FI deve usar label "Fita" em vez de "Laço"

`SYLLABLE_EMOJI_MAP["FI"]` usa 🎀 cujo label no catálogo é "Laço" (LA ❌). O mesmo emoji 🎀 pode ser renomeado para "Fita" (FI ✅).

`EMOJI_CATALOG` DEVE ter 🎀 com label "Fita" como entrada principal.

##### Scenario: FI label é Fita

- **GIVEN** o `EMOJI_CATALOG`
- **WHEN** procuro por 🎀
- **THEN** DEVE haver uma entrada `("🎀", "Fita")`
- **AND** o label "Laço" pode existir como entrada secundária

##### Requirement: LU deve usar label "Luz" em vez de "Lâmpada"

`SYLLABLE_EMOJI_MAP["LU"]` usa 💡 cujo label no catálogo é "Lâmpada" (LÂ ❌). 💡 pode ser renomeado para "Luz" (LU ✅).

##### Scenario: LU label é Luz

- **GIVEN** o `EMOJI_CATALOG`
- **WHEN** procuro por 💡
- **THEN** DEVE haver uma entrada `("💡", "Luz")` ou equivalente que comece com "lu"

##### Requirement: MA deve usar label "Mão" em vez de "Dorso da mão"

`SYLLABLE_EMOJI_MAP["MA"]` usa 🤚 cujo label é "Dorso da mão" (DO ❌). 🤚 pode ser renomeado para "Mão" (MA ✅).

##### Requirement: NE deve usar label "Neve" em vez de "Floco de neve"

`SYLLABLE_EMOJI_MAP["NE"]` usa ❄️ cujo label é "Floco de neve" (FL ❌). ❄️ pode ser renomeado para "Neve" (NE ✅).

##### Requirement: VO deve usar label "Vovó" em vez de "Idosa"

`SYLLABLE_EMOJI_MAP["VO"]` usa 👵 cujo label é "Idosa" (ID ❌). 👵 pode ser renomeado para "Vovó" (VO ✅).

##### Requirement: ON deve usar label "Onça" em vez de "Leopardo"

`SYLLABLE_EMOJI_MAP["ON"]` usa 🐆 cujo label é "Leopardo" (LE ❌). 🐆 pode ser renomeado para "Onça" (ON ✅).

##### Requirement: GRA deve usar label "Grama" em vez de "Erva"

`SYLLABLE_EMOJI_MAP["GRA"]` usa 🌿 cujo label é "Erva" (ER ❌). 🌿 pode ser renomeado para "Grama" (GRA ✅).

##### Requirement: 19 emojis ausentes devem ser adicionados ao catálogo

Os seguintes emojis existem em `SYLLABLE_EMOJI_MAP` mas NÃO existem em `EMOJI_CATALOG`:

CI 🎬, DI 💰, DU 🚿, JO 📰, JU 🥋, NO 🌙, SI 🔔, SU 😱, FRI 🥶, AN 💍, OR 🏅, BLO 🧱, CLA 🎼, CLI 🌡️, FLA 🪈, FLO 🌸, GLO 🌍, PLU 🪶, CRU ✝️

`EMOJI_CATALOG` DEVE conter ao menos uma entrada para cada um destes emojis com label em português.

##### Scenario: Todos os emojis de SYLLABLE_EMOJI_MAP estão no catálogo

- **GIVEN** `SYLLABLE_EMOJI_MAP`
- **WHEN** para cada `(sílaba, emoji)` no mapa
- **THEN** `emoji` DEVE existir em ao menos uma categoria de `EMOJI_CATALOG`
- **AND** DEVE haver um label em português associado

#### Implementation

**Arquivo:** `backend/app/services/images.py`

##### Renomear labels no `EMOJI_CATALOG`:

| Emoji | Label Atual | Novo Label | Seção |
|-------|-------------|------------|-------|
| 🎀 | "Laço" | "Fita" | objects (~line 345) |
| 💡 | "Lâmpada" | "Luz" | objects (~line 262) |
| 🤚 | "Dorso da mão" | "Mão" | actions (~line 570) |
| ❄️ | "Floco de neve" | "Neve" | nature (~line 215) |
| 👵 | "Idosa" | "Vovó" | people (~line 376) |
| 🐆 | "Leopardo" | "Onça" | animals (~line 140) |
| 🌿 | "Erva" | "Grama" | nature (~line 216) |

##### Trocar emojis no `SYLLABLE_EMOJI_MAP`:

| Sílaba | Emoji Atual | Novo Emoji | Motivo |
|--------|-------------|------------|--------|
| BU | 🐴 | 🐴 (renomear label para "Burro") ou 🐃 "Búfalo" | Cavalo ≠ BU |
| CE | 🌤️ | 🍒 "Cereja" | Sol com nuvem ≠ CE |
| CU | 🧊 | manter, mas adicionar label "Cubo" | Gelo ≠ CU |
| PI | 🍦 | trocar por 🐷 "Porco"? Não. Sem alternativa clara. | Sorvete ≠ PI |
| PU | 🦘 | 🦘 renomear para "Pula"? Não faz sentido. Sem alternativa. | Canguru ≠ PU |
| RI | 🌊 | manter, mas renomear para "Rio"? Onda é ONDA. | Onda ≠ RI |
| RU | 🏙️ | manter. Sem alternativa que comece com RU. | Paisagem ≠ RU |
| SE | 📮 | manter. Sem alternativa que comece com SE. | Caixa correio ≠ SE |
| ZA | 🥁 | 🥁 renomear para "Zabumba"? Ou trocar. | Tambor ≠ ZA |
| FRU | 🍎 | 🍎 "Fruta"? 🍇 "Uva". Nenhum começa com FRU. | Maçã ≠ FRU |
| TRI | 🛴 | 🛺 "Triciclo" | Patinete ≠ TRI |

##### Adicionar 19 emojis ao catálogo:

Adicionar ao final da categoria apropriada em `EMOJI_CATALOG`:

```python
# objects (~line 363)
("🎬", "Claquete"), ("💰", "Dinheiro"), ("🚿", "Chuveiro"),
("📰", "Jornal"), ("🥋", "Judô"), ("🔔", "Sino"),
("💍", "Anel"), ("🏅", "Medalha"),
("🧱", "Bloco"), ("🎼", "Clave"), ("🌡️", "Clima"),
("🪈", "Flauta"), ("🌍", "Globo"), ("🪶", "Pluma"),
("✝️", "Cruz"),
# nature (~line 249)
("🌙", "Lua"),
# people (~line 489)
("😱", "Susto"),
("🥶", "Frio"),
```

---

## Fase 2: Sílabas Complexas (CCV) — 16 entradas

### Problema

Das 16 sílabas complexas, **7** estão corretas, **6** têm problemas e **3** têm emojis não catalogados.

### Solução

Correções de label e troca de emojis similares às sílabas simples.

#### Added Requirements

##### Requirement: GRA deve começar com GRA

`SYLLABLE_EMOJI_MAP["GRA"]` usa 🌿 cujo label "Erva" não começa com GRA. DEVE ser renomeado para "Grama".

(Já coberto pelo Requirement de GRA na Fase 1.)

##### Requirement: FRA deve começar com FRA

`SYLLABLE_EMOJI_MAP["FRA"]` usa 🍗 "Coxa de frango" (CO ❌). DEVE ser substituído.

**Sugestão:** Trocar por 🍟 "Batata frita" — não começa com FRA. 🥓 "Bacon"? Não. Melhor: criar entrada "Frango" 🍗 no catálogo, separada de "Coxa de frango".

##### Requirement: TRI deve usar emoji que comece com TRI

`SYLLABLE_EMOJI_MAP["TRI"]` usa 🛴 "Patinete" (PA ❌). DEVE usar 🛺 "Triciclo" (TRI ✅).

##### Scenario: TRI exibe triciclo

- **GIVEN** `SYLLABLE_EMOJI_MAP["TRI"]`
- **WHEN** acessado por `get_emoji_for_syllable("TRI")`
- **THEN** DEVE retornar 🛺
- **AND** 🛺 DEVE ter label "Triciclo" no `EMOJI_CATALOG`

##### Requirement: FRI deve estar no catálogo

`SYLLABLE_EMOJI_MAP["FRI"]` usa 🥶 que não existe no `EMOJI_CATALOG`. DEVE ser adicionado com label "Frio".

#### Implementation

**Arquivo:** `backend/app/services/images.py`

```python
# SYLLABLE_EMOJI_MAP (~line 66-68)
"FRA": "🍗",  # manter, mas adicionar label "Frango" no catálogo
"TRI": "🛴",  # trocar para 🛺
```

Adicionar ao catálogo:
```python
# objects
("🥶", "Frio"),
("🛺", "Triciclo"),
```

Renomear:
```python
# objects — onde está "Coxa de frango", adicionar também "Frango"
```

---

## Fase 3: CVC (Consoante-Vogal-Consoante) — 14 entradas

### Problema

Das 14 sílabas CVC, **6** estão corretas, **6** têm labels incorretos e **2** não estão no catálogo.

### Solução

#### Added Requirements

##### Requirement: IN deve começar com IN

`SYLLABLE_EMOJI_MAP["IN"]` usa 🐛 "Lagarta" (LA ❌). DEVE ser substituído.

**Sugestão:** 🐛 não tem label começando com IN no catálogo atual. Adicionar "Inseto" ao catálogo ou trocar o emoji.

##### Scenario: IN exibe emoji coerente

- **GIVEN** 🐛 em `SYLLABLE_EMOJI_MAP["IN"]`
- **WHEN** verificado no catálogo
- **THEN** DEVE haver um label que comece com "in"
- **OR** o emoji DEVE ser trocado

##### Requirement: ON deve usar label "Onça"

`SYLLABLE_EMOJI_MAP["ON"]` usa 🐆 "Leopardo" (LE ❌). DEVE ser renomeado para "Onça" (ON ✅). (Já coberto na Fase 1.)

##### Requirement: AR não deve ser "Acertando alvo"

`SYLLABLE_EMOJI_MAP["AR"]` usa 🎯 "Acertando alvo" (AC ❌). 🎯 DEVE ser renomeado para "Alvo". (AL, não AR.)

**Nota:** "Alvo" começa com AL, não AR. Não há item no catálogo que comece com AR. Sugere-se trocar 🎯 por 🎨 "Arte" (começa com AR ✅) ou 🌈 "Arco-íris" (AR ✅) — mas 🌈 já é IR. Melhor: adicionar "Arco e flecha" ou usar 🎯 com label "Arremesso"?

##### Requirement: OR medalha no catálogo

`SYLLABLE_EMOJI_MAP["OR"]` usa 🏅 que não existe no catálogo. DEVE ser adicionado com label "Medalha" ou "Ouro".

#### Implementation

**Arquivo:** `backend/app/services/images.py`

```python
# SYLLABLE_EMOJI_MAP (~line 76-78)
"AR": "🎯",   # manter, adicionar label alternativo
"IN": "🐛",   # manter, renomear para "Inseto" ou trocar
"ON": "🐆",   # manter, renomear "Leopardo" → "Onça" já coberto
```

Adicionar ao catálogo:
```python
# animals ou objects
("🏅", "Medalha"),
```

---

## Resumo das Correções por Arquivo

### `backend/app/services/images.py`

#### `EMOJI_CATALOG` — Renomear Labels (7)

| Emoji | Linha Aprox. | Label Atual → Novo |
|-------|-------------|-------------------|
| 🎀 | 345 | "Laço" → "Fita" |
| 💡 | 262 | "Lâmpada" → "Luz" |
| 🤚 | 570 | "Dorso da mão" → "Mão" |
| ❄️ | 215 | "Floco de neve" → "Neve" |
| 👵 | 376 | "Idosa" → "Vovó" |
| 🐆 | 140 | "Leopardo" → "Onça" |
| 🌿 | 216 | "Erva" → "Grama" |

#### `EMOJI_CATALOG` — Adicionar Itens (19)

Adicionar os 19 emojis ausentes às categorias apropriadas.

#### `SYLLABLE_EMOJI_MAP` — Trocar Emojis (3)

| Linha | De | Para |
|-------|----|------|
| 30 | `"BU": "🐴"` | `"BU": "🐃"` (Búfalo) |
| 66 | `"TRI": "🛴"` | `"TRI": "🛺"` (Triciclo) |
| 69 | (FRA manter, adicionar label "Frango" no catálogo) | |

---

## Verificação

### Teste Automatizado (sugerido)

```python
# tests/test_syllable_emoji_alignment.py

def test_all_syllable_emojis_exist_in_catalog():
    from app.services.images import SYLLABLE_EMOJI_MAP, EMOJI_CATALOG
    
    catalog_emojis = set()
    for cat in EMOJI_CATALOG.values():
        for emoji, _ in cat["items"]:
            catalog_emojis.add(emoji)
    
    for syllable, emoji in SYLLABLE_EMOJI_MAP.items():
        assert emoji in catalog_emojis, f"{syllable}: {emoji} não está no catálogo"


def test_syllable_starts_with_syllable():
    from app.services.images import SYLLABLE_EMOJI_MAP, EMOJI_CATALOG
    
    emoji_labels = {}
    for cat in EMOJI_CATALOG.values():
        for emoji, label in cat["items"]:
            emoji_labels.setdefault(emoji, []).append(label)
    
    for syllable, emoji in SYLLABLE_EMOJI_MAP.items():
        labels = emoji_labels.get(emoji, [])
        syllable_lower = syllable.lower()
        has_match = any(
            label.lower().startswith(syllable_lower)
            for label in labels
        )
        assert has_match, f"{syllable}: {emoji} labels={labels} não começam com {syllable_lower}"
```

### Verificação Manual

1. Acessar cada lição de sílaba em `/lesson/3/{id}` e `/lesson/4/{id}` e confirmar visualmente
2. Abrir o admin em `/admin/emoji-mappings` e verificar que os 19 emojis ausentes agora aparecem
