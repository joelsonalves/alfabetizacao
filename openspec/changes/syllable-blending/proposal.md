## Why

Entre as lições de sílabas (PA, TO) e as lições de palavras completas (PATO), não há uma atividade de transição que ensine o aluno a *juntar* as sílabas para formar a palavra. Esta mudança introduz a **montagem silábica (blending)**: uma atividade onde o aluno lê e digita cada sílaba separadamente e depois a palavra completa, treinando a decodificação fonológica passo a passo.

## What Changes

- Novo tipo de lição `blending` que guia o aluno sílaba por sílaba até a palavra completa
- Novo módulo "Montagem Silábica" no seed data do backend, posicionado entre os módulos de sílabas complexas e palavras
- Cada lição `blending` armazena a palavra alvo e suas sílabas no campo `content` como JSON (`{"syllables": ["PA", "TO"], "word": "PATO"}`)
- Fluxo em 3 etapas por lição: Sílaba 1 → Sílaba 2 (etc.) → Palavra completa
- Em cada etapa: o aluno fala (speech recognition) e digita (teclado virtual) a sílaba ou palavra
- Reaproveita `useKeyboard`, `useSpeechRecognition` e `stopListening` já implementados
- Checklist adaptado: "Ler Sílaba 1", "Ler Sílaba 2", "Ler Palavra" em vez de "Ouvir/Falar/Teclar"
- Pontuação: 15pts por sílaba + 30pts pela palavra completa = 60pts por lição

## Capabilities

### New Capabilities
- `syllable-blending`: Atividade de montagem silábica com progressão passo a passo (sílaba → sílaba → palavra)

### Modified Capabilities
<!-- Nenhuma spec existente é modificada — este é um novo comportamento -->

## Impact

- `backend/app/seed.py` — novo módulo `blending` com seed data de palavras divididas em sílabas
- `frontend/src/pages/Lesson.jsx` — novo fluxo de renderização para `lesson_type === 'blending'`, incluindo `SPEECH_TYPE_NAMES`, `POINTS`, `SPEECH_TIMEOUTS`
- `frontend/src/components/ — novo componente `<SyllableBlending>` que gerencia os estados de cada etapa
- `frontend/src/components/SyllableBlending/SyllableBlending.css` — estilos da nova atividade
- `frontend/src/components/SyllableBlending/SyllableBlending.jsx` — lógica da montagem silábica
- `frontend/src/hooks/useSpeechRecognition.js` — sem alterações (já atende)
- `frontend/src/hooks/useKeyboard.js` — sem alterações (já atende)
- `frontend/src/tests/` — novos testes para o componente SyllableBlending
