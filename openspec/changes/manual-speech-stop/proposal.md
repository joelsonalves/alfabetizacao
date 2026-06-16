## Why

O timeout fixo de 4 segundos no reconhecimento de fala é insuficiente para frases/sentenças, cortando o áudio antes de o usuário terminar de ler. O usuário precisa de controle manual para sinalizar quando concluiu a leitura, eliminando a dependência de um timer artificial.

## What Changes

- Botão de microfone existente passa a alternar entre **"🎤 Ler em voz alta..."** (pronto) e **"🛑 Terminei de ler"** (ouvindo), substituindo o estado disabled atual
- O timeout de reconhecimento deixa de ser fixo e passa a ser configurável por tipo de lição: 20s para `sentence`/`phrase`, 4-8s para `letter`/`consonant`/`syllable`/`word`
- Chamada manual de `stopListening()` não dispara `onNoResult` ("Não entendi") — o silêncio após clique manual é tratado como "voltar ao normal" sem erro
- `useSpeechRecognition` passa a aceitar `timeoutMs` opcional em `startListening()` e suprime `onNoResult` quando a parada é manual

## Capabilities

### New Capabilities
- `manual-speech-stop`: Botão toggle para controle manual do microfone durante leitura de frases, com timeout dinâmico por tipo de lição

### Modified Capabilities
<!-- Nenhuma spec existente é modificada — este é um novo comportamento que ainda não estava especificado -->

## Impact

- `frontend/src/hooks/useSpeechRecognition.js` — `startListening` ganha parâmetro `timeoutMs`; `stopListening` sinaliza parada manual para suprimir `onNoResult` no `onend`
- `frontend/src/pages/Lesson.jsx` — botão toggle com texto dinâmico; `handleSpeech` bifurca entre start/stop; timeout calculado por `lesson.lesson_type`
- `frontend/src/tests/useSpeechRecognition.test.js` — novos testes para timeout configurável e supressão de `onNoResult` na parada manual
- `frontend/src/tests/Lesson.test.jsx` — mock do hook expõe `stopListening`; teste do toggle e do texto do botão
