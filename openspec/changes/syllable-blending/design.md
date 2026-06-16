## Context

Atualmente, o Módulo 4 (Sílabas Complexas) ensina sílabas isoladas como "GUE", "NHO", "BRA". O Módulo 5 (Palavras) já exibe a palavra completa "CASA" para o aluno digitar e falar. Não há uma etapa de transição que ensine o aluno a montar a palavra a partir das sílabas — um processo conhecido como **blending** ou **síntese fonológica**.

A plataforma já possui `useSpeechRecognition` (com suporte a `stopListening`) e `useKeyboard` para entrada silábica. O objetivo é reutilizar esses hooks sem modificações.

## Goals / Non-Goals

**Goals:**
- Criar um novo tipo de lição `blending` que guie o aluno: sílaba 1 → sílaba 2 → palavra completa
- Reutilizar `useKeyboard` e `useSpeechRecognition` sem alterações
- Adicionar seed data com palavras de 2 a 4 sílabas já divididas
- Manter consistência visual com o design atual das lições (badges, botão toggle, min-width)
- Pontuação progressiva: 15pts por sílaba + 30pts pela palavra = 60pts por lição

**Non-Goals:**
- Não alterar o comportamento das lições `word`, `syllable` ou outros tipos existentes
- Não implementar separação silábica automática no frontend (as sílabas vêm do backend)
- Não modificar `useSpeechRecognition` nem `useKeyboard`
- Não adicionar novos endpoints de API (reutiliza os existentes)

## Decisions

### 1. Componente `<SyllableBlending>` autónomo vs. lógica inline em `Lesson.jsx`

**Decisão:** Componente autónomo em `src/components/SyllableBlending/SyllableBlending.jsx`.

- **Alternativa A** (lógica inline): Misturaria o estado de blending com o estado genérico de `Lesson.jsx`, que já tem branches para `letter`, `consonant`, `syllable`, `word`, `phrase`, `sentence`. Adicionar blending inline tornaria o componente muito longo.
- **Alternativa B** (componente autónomo): Encapsula toda a lógica de etapas, mantendo `Lesson.jsx` limpo. A interface pública do componente é:
  ```jsx
  <SyllableBlending
    lesson={lesson}
    onComplete={() => handleComplete()}
  />
  ```
  O `onComplete` é chamado quando o aluno conclui a palavra final.

### 2. Estrutura de dados no backend (`content` como JSON)

**Decisão:** O campo `content` das lições `blending` armazena um JSON string com `{ "syllables": string[], "word": string }`.

```python
{"name": "Montar PATO", "lesson_type": "blending", "target": "PATO",
 "content": json.dumps({"syllables": ["PA", "TO"], "word": "PATO"})}
```

- O `target` permanece como a palavra completa para compatibilidade com o schema existente.
- O `content` é usado exclusivamente pelo componente `<SyllableBlending>`.
- Alternativa (nova coluna no banco): exigiria migração de BD, desnecessária para este caso.

### 3. Fluxo de etapas e estado

**Decisão:** Máquina de estados simples com `useState`:

```
currentStep: 0 → 1 → 2 → complete
```
- `stepList`: `["PA", "TO", "PATO"]`  (derivado de `content.syllables` + `content.word`)
- Cada etapa tem `status`: `"pending" | "current" | "done"`
- O aluno completa cada etapa falando E digitando a sílaba/palavra
- Ao completar a última etapa (`"PATO"`), chama `onComplete`

### 4. Speech recognition por etapa

**Decisão:** Speech recognition roda **apenas na etapa atual**. Ao mudar de etapa, o reconhecimento é reiniciado.

- Quando `step` avança, `startListening` é chamado novamente com um `timeoutMs` ajustado (4s para sílabas de 2 letras, 10s para palavras maiores)
- O matching de fala usa `normalizeText` já existente (compara `spoken` vs `stepList[currentStep]`)
- Usa `stopListening` existente para interromper manualmente

### 5. Teclado virtual por etapa

**Decisão:** `useKeyboard` é instanciado uma vez e sua saída é comparada com a sílaba/palavra alvo da etapa atual.

- Ao completar a digitação correta da etapa, o teclado é resetado (target muda para a próxima etapa)
- O `useKeyboard` recebe o target atual como prop

### 6. Pontuação

**Decisão:** `POINTS` em `Lesson.jsx` é mapeado para `60pts` por lição `blending`, mas o componente controla internamente frações.

- Sílabas: 15pts cada (ex: 2 sílabas = 30pts)
- Palavra final: 30pts
- Total = `(15 × n_sílabas) + 30 = 60` para palavras de 2 sílabas
- A pontuação é registrada apenas no `onComplete`, com valor total de 60pts
- Internamente o componente pode marcar progresso parcial, mas o envio ao backend é no final

### 7. Seed data

**Decisão:** O seed cria um módulo `blending` entre os módulos de sílabas complexas e palavras, rotulando como "Montagem Silábica".

- Palavras selecionadas: 2-4 sílabas, cobrindo diferentes padrões silábicos (CV, CVC, CCV)
- Priorizar palavras que já existem no módulo `word` para consistência curricular
- O seed é idempotente (recria se executado novamente)

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| **Palavras com >3 sílabas podem ser cansativas** | O seed prioriza 2-3 sílabas; o componente suporta N sílabas genericamente |
| **Aluno pode decorar a sequência sem ler as sílabas** | A ordem das etapas é fixa (sílaba1 → sílaba2 → palavra); o design pedagógico intencionalmente força a leitura de cada parte |
| **Compatibilidade com `useKeyboard`** | O hook atual aceita um `target` via prop; precisamos garantir que o target mude dinamicamente entre etapas |
| **Navegação entre lições** | `Lesson.jsx` já gerencia navegação "Próxima lição" via `handleComplete` |
| **Palavras com pronúncia irregular** | Todas as palavras do seed são regulares (excluir "HOMEM", "EXCETO", etc.) |

## Migration Plan

1. Adicionar seed data no backend (novo módulo `blending`)
2. Criar componente `<SyllableBlending>` com a lógica de etapas
3. Integrar em `Lesson.jsx` no `lesson_type === 'blending'`
4. Adicionar estilos CSS
5. Testar manualmente no navegador
6. Rodar `pytest` e `npm test` para garantir que nada quebrou
7. Recriar seed data no banco local

## Open Questions

- O checklist de etapas deve aparecer como badges `[1]`, `[2]`, `[3]` ou como uma lista de progresso?
  - Pendente: confirmar com o usuário se prefere badges (estilo atual) ou lista de progresso (ex: "✅ PA • ⏳ TO • ⬜ PATO")
- `Lesson.jsx` usa `checklistItems` dinamicamente — precisamos mapear as sílabas para os checkboxes?
  - Pendente: decidir se o `SyllableBlending` expõe seu próprio checklist ou se `Lesson.jsx` o gera a partir do `content`
