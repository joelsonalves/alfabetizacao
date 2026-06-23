# Business Rules → Database

Migração de regras de negócio atualmente hardcoded no código para o banco de dados, organizada em 3 fases independentes.

---

## Fase 1: Corrigir Duplicação de LETTER_WORDS (Crítico)

### Problema

O dicionário `LETTER_WORDS` existe em **dois lugares** no frontend:

| Arquivo | W | X |
|---|---|---|
| `frontend/src/constants/speech.js:10-16` | `'web'` ✅ | `'xícara'` ✅ |
| `frontend/src/hooks/useSpeech.js:12-18` | `'waffle'` ❌ | `'xis'` ❌ |

A função `speakLetterWithWord` em `useSpeech.js:91` usa `LETTER_WORDS` local quando `word` não é passada. Isso faz o TTS falar "W... de Waffle." mesmo com o banco e `speech.js` já corrigidos para "web".

### Solução

Eliminar a duplicação: importar `LETTER_WORDS` e `LETTER_SOUNDS` de `speech.js` em vez de redeclará-los.

#### Added Requirements

##### Requirement: Import de LETTER_WORDS em useSpeech.js

`frontend/src/hooks/useSpeech.js` DEVE importar `LETTER_WORDS` e `LETTER_SOUNDS` de `../constants/speech` em vez de defini-los localmente.

##### Scenario: speakLetterWithWord sem word parâmetro

- **WHEN** `speakLetterWithWord("W")` é chamado sem o parâmetro `word`
- **THEN** DEVE usar `LETTER_WORDS["W"]` do arquivo importado
- **AND** DEVE falar `"W... de Web."`
- **AND** NÃO DEVE falar `"W... de Waffle."`

##### Scenario: speakLetterWithWord com word parâmetro

- **WHEN** `speakLetterWithWord("W", "web")` é chamado
- **THEN** DEVE usar o parâmetro `"web"` em vez de `LETTER_WORDS["W"]`
- **AND** DEVE falar `"W... de Web."`

##### Scenario: LETTER_SOUNDS importado

- **WHEN** `speakLetter("X")` é chamado
- **THEN** DEVE usar `LETTER_SOUNDS["X"]` do arquivo importado
- **AND** DEVE falar `"xis"`

#### Implementation (manual — edit tool bloqueado para hooks/)

**Arquivo:** `frontend/src/hooks/useSpeech.js`

1. **Remover** as linhas 3-18 (declarações de `LETTER_SOUNDS` e `LETTER_WORDS`)
2. **Adicionar** no topo, após o import existente:
   ```js
   import { LETTER_SOUNDS, LETTER_WORDS } from '../constants/speech'
   ```

O resto do código (`speakLetterWithWord` linha 89-99, `speakLetter` linha 76-79) usa `LETTER_SOUNDS` e `LETTER_WORDS` por nome — funciona igual com os valores importados.

**Verificação:** após a mudança, `LETTER_WORDS["W"]` vira `'web'` em vez de `'waffle'`.

---

## Fase 2: Tabela scoring_rules no Banco de Dados

### Problema

Regras de pontuação, timeouts e configurações de TTS estão hardcoded:

| Regra | Local | Valor |
|---|---|---|
| Pontos por lição | `lesson.js:1` | letter=10, syllable=25, word=50, blending=60, phrase=100, sentence=100 |
| Pontos por tecla | `useKeyboard.js:47` | +10 (hardcoded) |
| Timeouts por lição | `lesson.js:28-36` | letter=4000ms, syllable=6000ms, word=8000ms, blending=20000ms, phrase=20000ms, sentence=20000ms |
| TTS rate | `useSpeech.js:63` | 0.9 |
| TTS pitch | `useSpeech.js:64` | 1.0 |
| XP por nível | `progress.py:7-8` | `xp >= level * 500` |

### Solução

Criar tabela `scoring_rules` no banco de dados com CRUD via admin.

#### Added Requirements

##### Requirement: Nova tabela scoring_rules

O banco de dados DEVE ter uma tabela `scoring_rules` com a seguinte estrutura:

```sql
CREATE TABLE scoring_rules (
    id SERIAL PRIMARY KEY,
    rule_key VARCHAR(50) UNIQUE NOT NULL,        -- ex: 'points_letter', 'timeout_syllable', 'tts_rate'
    lesson_type VARCHAR(50),                      -- nullable, ex: 'letter', 'syllable', NULL para global
    value JSON NOT NULL,                          -- ex: 10, 4000, 0.9, {"base": 10, "per_key": 2}
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

##### Scenario: Admin consulta scoring_rules

- **WHEN** o admin acessa a rota `GET /api/admin/scoring-rules`
- **THEN** DEVE retornar todas as regras cadastradas
- **AND** cada regra DEVE conter `rule_key`, `lesson_type`, `value`, `description`, `active`

##### Scenario: Admin atualiza uma regra

- **WHEN** o admin envia `PUT /api/admin/scoring-rules/{rule_key}` com `{ "value": 15 }`
- **THEN** o valor DEVE ser atualizado no banco
- **AND** a resposta DEVE refletir o novo valor

##### Scenario: Frontend carrega regras no startup

- **WHEN** o frontend inicializa uma lição
- **THEN** DEVE buscar `GET /api/scoring-rules?lesson_type=letter`
- **AND** usar os valores do banco em vez das constantes hardcoded

##### Scenario: Fallback se API falhar

- **WHEN** a requisição de scoring_rules falha (offline/erro)
- **THEN** o frontend DEVE usar os valores atuais hardcoded como fallback

#### Dados iniciais (seed)

```json
[
  { "rule_key": "points_letter", "lesson_type": "letter", "value": 10, "description": "Pontos por completar lição de letra" },
  { "rule_key": "points_syllable", "lesson_type": "syllable", "value": 25, "description": "Pontos por completar lição de sílaba" },
  { "rule_key": "points_word", "lesson_type": "word", "value": 50, "description": "Pontos por completar lição de palavra" },
  { "rule_key": "points_blending", "lesson_type": "blending", "value": 60, "description": "Pontos por completar lição de montagem" },
  { "rule_key": "points_phrase", "lesson_type": "phrase", "value": 100, "description": "Pontos por completar lição de frase" },
  { "rule_key": "points_sentence", "lesson_type": "sentence", "value": 100, "description": "Pontos por completar lição de oração" },
  { "rule_key": "points_per_key", "lesson_type": null, "value": 10, "description": "Pontos por tecla correta" },
  { "rule_key": "timeout_letter", "lesson_type": "letter", "value": 4000, "description": "Timeout em ms para lições de letra" },
  { "rule_key": "timeout_syllable", "lesson_type": "syllable", "value": 6000, "description": "Timeout em ms para lições de sílaba" },
  { "rule_key": "timeout_word", "lesson_type": "word", "value": 8000, "description": "Timeout em ms para lições de palavra" },
  { "rule_key": "timeout_blending", "lesson_type": "blending", "value": 20000, "description": "Timeout em ms para montagem silábica" },
  { "rule_key": "timeout_phrase", "lesson_type": "phrase", "value": 20000, "description": "Timeout em ms para lições de frase" },
  { "rule_key": "timeout_sentence", "lesson_type": "sentence", "value": 20000, "description": "Timeout em ms para lições de oração" },
  { "rule_key": "tts_rate", "lesson_type": null, "value": 0.9, "description": "Taxa de fala do TTS (0.1 a 2.0)" },
  { "rule_key": "tts_pitch", "lesson_type": null, "value": 1.0, "description": "Tom de voz do TTS (0.1 a 2.0)" },
  { "rule_key": "xp_per_level", "lesson_type": null, "value": 500, "description": "XP necessário por nível (level * valor)" }
]
```

---

## Fase 3: Tabela emoji_mappings no Banco de Dados

### Problema

Todos os mapeamentos de emoji estão hardcoded em `backend/app/services/images.py`:

| Dicionário | Entradas | Exemplo |
|---|---|---|
| `EMOJI_MAP` | 26 | `"A": "🐝"` |
| `SYLLABLE_EMOJI_MAP` | ~100 | `"BA": "🍬"` |
| `WORD_EMOJI_MAP` | ~40 | `"casa": "🏠"` |
| `LETTER_ASSOCIATION` | 26 | `"A": "abelha"` |

Um admin não consegue alterar nenhum emoji sem editar Python e fazer deploy.

### Solução

Criar tabela `emoji_mappings` e migrar os dicionários para o banco. Manter fallback em código para quando a tabela estiver vazia (durante transição).

#### Added Requirements

##### Requirement: Nova tabela emoji_mappings

```sql
CREATE TABLE emoji_mappings (
    id SERIAL PRIMARY KEY,
    mapping_type VARCHAR(20) NOT NULL,   -- 'letter', 'syllable', 'word', 'association'
    key VARCHAR(50) NOT NULL,            -- 'A', 'BA', 'casa'
    emoji VARCHAR(30) NOT NULL,          -- '🐝'
    label VARCHAR(100),                   -- opcional, nome do emoji
    UNIQUE(mapping_type, key)
);
```

##### Scenario: lookup substitui dicionário hardcoded

- **WHEN** `get_emoji_for_letter("A")` é chamado
- **THEN** DEVE consultar `emoji_mappings WHERE mapping_type='letter' AND key='A'`
- **AND** se encontrado, DEVE retornar o emoji do banco
- **AND** se NÃO encontrado, DEVE usar `EMOJI_MAP` hardcoded como fallback

##### Scenario: Admin gerencia emoji_mappings

- **WHEN** o admin acessa `GET /api/admin/emoji-mappings?type=letter`
- **THEN** DEVE listar todos os mapeamentos de letras
- **AND** DEVE permitir editar emoji e label

##### Scenario: Admin altera emoji de A

- **WHEN** admin altera `emoji_mappings` de A para `"🐨"` (coala)
- **THEN** `get_emoji_for_letter("A")` DEVE retornar `"🐨"`
- **AND** toda lição da letra A DEVE exibir o novo emoji

#### Estratégia de migração

1. Criar tabela `emoji_mappings`
2. Seed inicial: popular com todos os valores de `EMOJI_MAP`, `SYLLABLE_EMOJI_MAP`, `WORD_EMOJI_MAP`, `LETTER_ASSOCIATION`
3. Modificar funções em `images.py` para consultar BD primeiro, fallback para dicionário
4. Admin CRUD sobre a tabela
5. Futuro: remover dicionários hardcoded quando a migração estiver consolidada

---

## Fase 4: Catálogo de Conquistas

### Problema

`achievement_type` em `user_achievements` é uma string livre sem validação. Não há tabela de lookup para conquistas disponíveis.

### Solução

Criar tabela `achievement_definitions` com CRUD admin.

#### Added Requirements

##### Requirement: Nova tabela achievement_definitions

```sql
CREATE TABLE achievement_definitions (
    id SERIAL PRIMARY KEY,
    achievement_type VARCHAR(50) UNIQUE NOT NULL,   -- 'first_lesson', 'streak_7', 'all_vowels'
    name VARCHAR(100) NOT NULL,                      -- 'Primeira Lição!'
    description TEXT,                                 -- 'Complete sua primeira lição'
    icon VARCHAR(30),                                 -- '🏆'
    criteria JSON,                                    -- {"type": "lessons_completed", "count": 1}
    active BOOLEAN DEFAULT TRUE
);
```

##### Scenario: Admin gerencia conquistas

- **WHEN** admin acessa `GET /api/admin/achievements`
- **THEN** DEVE listar todas as conquistas definidas
- **AND** admin pode criar, editar, desativar conquistas

##### Scenario: Unlock valida contra catálogo

- **WHEN** backend recebe requisição para desbloquear conquista
- **THEN** DEVE verificar se `achievement_type` existe em `achievement_definitions`
- **AND** se não existir, DEVE retornar erro 400

#### Dados iniciais (sugestão)

```json
[
  { "type": "first_lesson", "name": "Primeira Lição!", "description": "Complete sua primeira lição", "icon": "🏆" },
  { "type": "streak_3", "name": "Dedicação", "description": "Estude por 3 dias seguidos", "icon": "🔥" },
  { "type": "streak_7", "name": "Semana Completa", "description": "Estude por 7 dias seguidos", "icon": "💪" },
  { "type": "streak_30", "name": "Mestre da Rotina", "description": "Estude por 30 dias seguidos", "icon": "👑" },
  { "type": "all_vowels", "name": "Vogais Completas", "description": "Complete todas as vogais", "icon": "🔤" },
  { "type": "all_consonants", "name": "Consoantes Completas", "description": "Complete todas as consoantes", "icon": "🔠" },
  { "type": "score_100", "name": "Nota Máxima", "description": "Tire 100 em uma lição", "icon": "💯" },
  { "type": "no_errors", "name": "Perfeição", "description": "Complete uma lição sem erros", "icon": "⭐" }
]
```

---

## Sumário de Prioridades

| Fase | Descrição | Impacto | Esforço |
|---|---|---|---|
| **1** | Import LETTER_WORDS de speech.js (eliminar duplicação) | 🔴 Crítico — corrige bug ativo | 5 min |
| **2** | Tabela scoring_rules + CRUD admin + frontend consumir | 🟡 Alto — admin configura pontuação | 2-3 dias |
| **3** | Tabela emoji_mappings + fallback + CRUD admin | 🟡 Alto — admin troca emojis sem deploy | 3-4 dias |
| **4** | Tabela achievement_definitions + validação + CRUD | 🟢 Médio — catálogo de conquistas | 1-2 dias |
