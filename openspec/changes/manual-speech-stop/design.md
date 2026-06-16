## Context

O hook `useSpeechRecognition` atualmente usa `SPEECH_TIMEOUT = 4000` fixo e não expõe `stopListening` para o componente `Lesson`. O botão de microfone fica desabilitado (`disabled = true`) enquanto ouve, sem permitir que o usuário interrompa manualmente. Para frases longas, o timeout de 4s corta a fala do usuário.

O `stopListening` já existe no hook, mas não é destruturado no Lesson e, quando chamado, dispara `onNoResult` no `onend` (pois a flag `hasResult` pode ser `false`), o que não é desejável para parada manual voluntária.

## Goals / Non-Goals

**Goals:**
- Botão único de microfone alterna entre `🎤 Ler em voz alta` e `🛑 Terminei de ler`
- Badge numerado `[1]` e `[2]` nos botões para indicar sequência
- Botões com mesmo tamanho, borda visível e hover consistente
- Ao clicar "Terminei de ler", o reconhecimento para sem disparar mensagem de erro
- Timeout de segurança maior para `sentence`/`phrase` (20s) e ajustado para os demais tipos
- Toggle implementado exclusivamente via estado `isListening` do hook — sem novo estado no Lesson

**Non-Goals:**
- Não alterar o algoritmo de matching (`tryExtractTarget`, `isSubsequence`)
- Não alterar o fluxo de TTS (`useSpeech`)
- Não adicionar novos botões ou componentes
- Não modificar o backend

## Decisions

### Decisão 1: Toggle no botão existente em vez de botão separado "Concluído"

| Alternativa | Prós | Contras |
|-------------|------|---------|
| **Botão único toggle (escolhido)** | Menos mudanças de layout, sem novo estado, sem confusão visual | Texto do botão precisa ser claro nos dois estados |
| Botão "Concluído" separado | Ação explícita de "parar" | Mais elementos na tela, maior chance de erro de toque, mais código |

**Rationale**: O usuário sugeriu o toggle. Um único botão que muda de rótulo é mais limpo e consistente com o padrão de "gravar/parar" de outros apps de áudio.

### Decisão 2: Timeout dinâmico por tipo de lição

| Tipo | Timeout | Rationale |
|------|---------|-----------|
| `letter`, `consonant` | 4s | Uma letra, fala instantânea |
| `syllable` | 6s | Uma sílaba, leve pausa |
| `word` | 8s | Palavra completa |
| `sentence`, `phrase` | 20s | Frase longa, leitura pausada |

**Rationale**: Manter 4s para tipos curtos preserva o comportamento existente e evita espera desnecessária. 20s para frases é generoso para qualquer tamanho de sentença.

### Decisão 3: Flag `manualStop` no hook para suprimir `onNoResult`

Quando o usuário clica "Terminei de ler":
1. `manualStopRef.current = true` (via `stopListening`)
2. `recognition.stop()` é chamado
3. `onend` dispara
4. Se `!hasResult && manualStopRef.current` → não chama `onNoResult` (silêncio)
5. Se `!hasResult && !manualStopRef.current` → chama `onNoResult` (timeout, comportamento existente)

**Alternativa rejeitada**: Passar um parâmetro `silent` para `stopListening()`. Funciona, mas exigiria modificar a assinatura da função. Uma ref interna é mais limpa.

### Decisão 5: Badge numerado nos botões para indicar sequência

Os botões "Ouvir" e "Ler em voz alta" recebem um badge circular com `[1]` e `[2]` respectivamente. O badge é um `<span>` estilizado com `border-radius: 50%`, fundo `--color-primary` e texto branco. O `[2]` persiste em ambos os estados do toggle ("Ler em voz alta" e "Terminei de ler") porque é o mesmo botão.

**Rationale**: O número dá ao usuário a percepção de que "primeiro ouça, depois fale" — uma sequência pedagógica que já existia no checklist mas agora fica visível nos botões.

### Decisão 6: Botões com largura mínima e borda uniforme

Ambos os botões em `.speech-actions` recebem `min-width: 200px` e `padding: 10px 20px`. O `.btn-ghost` (Ouvir) ganha `border: 1px solid var(--border-color)` para ter a mesma aparência de botão do `.btn-secondary` (Ler). O hover do `.btn-ghost` usa `background: var(--bg-primary)` para igualar ao hover do `.btn-secondary`.

**Rationale**: Sem borda, o botão Ouvir parecia um link em vez de botão, causando desalinhamento visual com o botão Ler em voz alta.

### Decisão 7: `🎤 Ler em voz alta` sem reticências

O texto do botão foi alterado de `"🎤 Ler em voz alta..."` para `"🎤 Ler em voz alta"` (sem reticências).

**Rationale**: As reticências sugeriam carregamento ou ação pendente. Como o botão é um comando direto ("clique para começar a falar"), o texto sem reticências é mais limpo e assertivo. Coerente com o padrão de outros apps de áudio (WhatsApp, Telegram) que usam "Gravar" sem reticências.

### Decisão 4: `interimResults` permanece `false`

Manter `interimResults = false` evita complexidade de gerenciar resultados parciais. Com o timeout de 20s para frases, o navegador tem tempo suficiente para processar a fala e disparar `onresult` naturalmente. O botão "Terminei de ler" é um complemento de segurança, não o fluxo principal.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Navegador não dispara `onresult` mesmo com fala (raro) | Botão "Terminei de ler" alternativo + timeout de segurança |
| Usuário clica "Terminei de ler" antes de falar | `manualStop` flag suprime "Não entendi" — volta silenciosamente ao estado inicial |
| Texto do botão pode não ser intuitivo para todos | "🎤 Ler em voz alta..." e "🛑 Terminei de ler" são autoexplicativos |
| Testes existentes mockam `useSpeechRecognition` sem `stopListening` | Mock precisa ser atualizado para expor `stopListening` (já testado em `useSpeechRecognition.test.js`) |
