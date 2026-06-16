## Context

O componente `Lesson.jsx` possui o fluxo de reconhecimento de fala:

1. Usuário clica "Falar" → `startListening()` do hook `useSpeechRecognition`
2. Web Speech API retorna um `transcript` (texto reconhecido)
3. `handleSpeech` chama `tryExtractTarget(transcript, target, sounds)` que valida se o transcript corresponde ao alvo
4. O `transcript` bruto é usado diretamente no feedback visual (`addFeedback`) e no TTS (`speak`)

Problema: quando o ASR interpreta "B" como "bairro" (palavra comum no vocabulário do motor), o transcript "LETRA BAIRRO" é exibido e falado, confundindo o usuário que falou corretamente.

## Goals / Non-Goals

**Goals:**
- Extrair o conteúdo relevante (letra/sílaba/palavra) do transcript do ASR, removendo prefixos e ruído
- Usar o conteúdo extraído no feedback visual e no TTS em vez do transcript bruto
- Quando o match é correto, exibir/falar apenas o alvo (ex: "B")
- Quando o match falha, exibir/falar o transcript para depuração, mas com fallback inteligente
- Corrigir o bug de espaço residual no prefix stripping

**Non-Goals:**
- Não alterar a lógica de matching (`tryExtractTarget`) — a nova função `extractSpokenContent` a substitui
- Não alterar o hook `useSpeechRecognition`
- Não alterar o hook `useSpeech` ou configuração de TTS
- Não alterar outros fluxos da lição (teclado, progresso, navegação)
- Não adicionar novas dependências

## Decisions

### 1. Função dedicada vs. modificação in-place
**Decisão**: Criar função separada `extractSpokenContent` em vez de modificar `tryExtractTarget`.
**Rationale**: Separação de concerns — `tryExtractTarget` valida (boolean), `extractSpokenContent` extrai (retorna objeto `{content, isCorrect}`). Facilita teste e manutenção.

### 2. Fallback para feedback quando match falha
**Decisão**: Quando o match falha, extrair a palavra mais curta do transcript (provavelmente a letra/sílaba) para exibição no feedback, mas ainda mostrar o transcript original como referência.
**Rationale**: O transcript original ainda é útil para depuração, mas a palavra mais curta dá ao usuário uma dica do que foi reconhecido.

### 3. Localização da nova função
**Decisão**: `extractSpokenContent` será definida como arrow function dentro de `Lesson.jsx`, mesma estratégia da `tryExtractTarget` existente.
**Rationale**: Mantém consistência com o código existente. Se precisar ser compartilhada no futuro, pode ser extraída para um módulo separado.

### 4. Correção do prefix stripping
**Decisão**: Adicionar `.trim()` no resultado do `replace` de prefixos.
**Rationale**: Bug claro — `normalize(prefix)` faz `.trim()` e perde o espaço, mas o `replace` não compensa isso.

### 5. Feedback TTS usa displayTarget em vez de content extraído
**Decisão**: O texto enviado ao TTS (`speak()`) deve usar o `displayTarget` (alvo da lição vindo do banco de dados) em vez do `content` extraído do ASR.
**Rationale**: Testes mostraram que mesmo com `content = "B"` (extraído corretamente do ASR e exibido corretamente no texto), o TTS pronuncia "bairro". A hipótese é um bug no motor de síntese de fala do navegador ao interpretar a letra "B" isolada. Usar uma mensagem estruturada com `displayTarget` (ex: `"Muito bem! Você acertou a letra B."`) elimina ambiguidade — a string é fixa, pré-definida e não depende do resultado do ASR.

### 6. Mensagens TTS acerto e erro
**Decisão**: As mensagens do TTS serão:
- **Acerto**: `"Muito bem! Você acertou a letra ${displayTarget}."`
- **Erro**: `"Quase! Tente novamente. A letra é ${displayTarget}."`
**Rationale**: Mensagens claras e contextualizadas, sem repetir o que o ASR transcreveu. O `displayTarget` vem da lição no banco de dados, não do ASR, garantindo que o TTS sempre fale o alvo correto.

## Risks / Trade-offs

- **[Falso positivo em cenário raro]** Se alguém falar uma palavra longa que contenha o alvo como substring, o short-words filter pode extrair o alvo incorretamente. → Mitigação: o fallback só afeta a exibição, nunca a correção do match. O `isCorrect` continua sendo determinado pela validação rigorosa.
- **[Regressão de feedback]** Se a extração falhar em um caso extremo, o feedback pode mostrar string vazia. → Mitigação: fallback para o transcript original se a extração não produzir resultado.
- **[Mudança em código de produção testado]** Lesson.jsx tem 82 testes. → Mitigação: mudanças localizadas (~20 linhas), sem alterar hooks ou serviços externos.
