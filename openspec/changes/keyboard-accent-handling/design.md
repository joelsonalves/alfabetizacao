## Context

O hook `useKeyboard.js` gerencia a entrada do teclado (físico e virtual) nas lições. Seu método `handleKeyDown` compara diretamente a tecla pressionada com o caractere esperado usando `===` (linha 53). O método `normalize()` em `Lesson.jsx` já implementa a lógica de normalização NFD + remoção de diacríticos, mas é usado apenas no reconhecimento de fala.

Palavras acentuadas nos dados de lições (frases/sentenças) — como "SOFÁ", "SÃO", "É", "PÔS", "À" — não podem ser digitadas porque o teclado produz `A`, `E`, `O`, etc., sem acento.

## Goals / Non-Goals

**Goals:**
- Aceitar teclas sem acento como equivalentes às suas versões acentuadas no matching do teclado
- Preservar os acentos na exibição visual (`typedChars`) e na verificação de completude
- Manter compatibilidade com todos os caracteres sem acento existentes

**Non-Goals:**
- Não alterar dados do banco de dados
- Não alterar o layout do teclado virtual
- Não alterar o reconhecimento de fala
- Não adicionar novas dependências

## Decisions

### 1. Normalização NFD (Unicode Normalization Form D)

**Decisão**: Usar `s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')` para remover acentos, mesma lógica do `normalize()` em Lesson.jsx.

**Rationale**: A normalização NFD decompõe caracteres acentuados na letra base + combining mark. O regex `[\u0300-\u036f]` remove todas as combining marks (acentos agudo, circunflexo, til, cedilha, etc.). Isso cobre todos os acentos do português: `ÁÂÃÀÉÊÍÓÔÕÚÇ`.

### 2. Local da função de normalização

**Decisão**: Adicionar uma função auxiliar `normalizeKey(s)` local no hook `useKeyboard.js`, em vez de importar de Lesson.jsx.

**Rationale**: Evita dependência circular e mantém o hook autossuficiente. A lógica é simples (2 linhas) e não justifica um módulo separado.

### 3. O que armazenar no `typedChars`

**Decisão**: Quando a tecla normalizada coincide com o esperado normalizado, armazenar o caractere **esperado** (acentuado) em vez do pressionado (sem acento).

**Rationale**: A exibição visual mostra `typedChars` diretamente no JSX (`{kb.typedChars}` - linha 383). Se armazenássemos a tecla pressionada sem acento, o display mostraria "SOFA" em vez de "SOFÁ", quebrando a correspondência visual com o alvo.

### 4. Verificação de completude

**Decisão**: Normalizar também na comparação de completude: `normalizeKey(newTyped) === normalizeKey(target.toUpperCase())`.

**Rationale**: O `newTyped` conterá os caracteres esperados (acentuados), e o `target.toUpperCase()` também tem acentos. Ambos normalizados dão o mesmo resultado. Essa abordagem é consistente e segura.

### 5. Teclado virtual (VirtualKeyboard)

**Decisão**: Não adicionar teclas acentuadas ao VirtualKeyboard. A normalização já permite que o usuário clique em `A` para digitar `Á`.

**Rationale**: O teclado virtual tem espaço limitado. Adicionar `Á`, `É`, `Í`, `Ó`, `Ú`, `Ã`, `Õ`, `Â`, `Ê`, `Ô` exigiria redimensionamento significativo. A normalização resolve sem alterar o layout.

## Risks / Trade-offs

- **[Perda de distinção ortográfica]** Se houver duas palavras que diferem apenas por acento (ex: "sabia" vs "sabia" — não existe em pt-BR, mas como conceito), a normalização aceitaria ambas. → Mitigação: não há palavras homógrafas no conjunto de dados atual; se houver no futuro, a normalização ainda aceita a forma correta.
- **[Performance]** A normalização NFD é chamada para cada tecla pressionada. → Mitigação: operação O(1) em strings curtas (1 caractere), sem impacto perceptível.
- **[Teclas especiais]** Caracteres como `Ç` — `normalize('Ç')` remove a cedilha → `'C'`. Isso aceitaria `C` como equivalente a `Ç`. No português, `C` e `Ç` não são equivalentes (ex: "coco" vs "coco"), mas nos dados atuais não há conflito. → Aceito como trade-off para consistência.
