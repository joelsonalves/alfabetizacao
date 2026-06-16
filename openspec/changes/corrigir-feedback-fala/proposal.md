## Why

Quando um usuário fala "LETRA B" no microfone, o motor de reconhecimento de fala do navegador frequentemente interpreta o som "bê" como a palavra "bairro", resultando no transcript "LETRA BAIRRO". Esse transcript cru é exibido no feedback e falado pelo TTS, causando confusão — o sistema diz "Você falou LETRA BAIRRO" quando na verdade o usuário falou corretamente a letra B.

## What Changes

- **Nova função `extractSpokenContent`**: Extrai o conteúdo relevante do transcript do ASR (prefix stripping + extração da letra/palavra), retornando tanto o conteúdo extraído quanto se o match é válido
- **Feedback textual usa `content` extraído**: Em vez de exibir o transcript bruto, o feedback visual usa o conteúdo extraído (ex: "B")
- **TTS usa `displayTarget` em mensagens estruturadas**: Em vez de repetir o transcript ou o `content` extraído, o TTS usa mensagens fixas com o alvo da lição (ex: `"Muito bem! Você acertou a letra B."`) — eliminando ambiguidade de pronúncia do motor de síntese de fala
- **Correção do prefix stripping**: Adiciona `.trim()` no resultado do `replace` de prefixos para eliminar espaço residual
- **Fallback inteligente**: Quando o match falha, extrai a palavra mais curta do transcript para exibição (evita mostrar "BAIRRO" inteiro se "B" foi detectado)

## Capabilities

### New Capabilities
- `speech-feedback-extraction`: Extração do conteúdo falado relevante a partir do transcript bruto do reconhecimento de fala, usado para feedback visual e TTS

### Modified Capabilities
<!-- Nenhuma capability existente está sendo modificada -->

## Impact

- **Arquivo alterado**: `frontend/src/pages/Lesson.jsx` — ~20 linhas alteradas (função `handleSpeech` + nova função `extractSpokenContent`)
- **Nenhuma breaking change**: Apenas a representação do feedback é alterada; a lógica de matching, pontuação e progresso permanece idêntica
- **Nenhuma nova dependência**: Tudo resolvido com JS puro
- **Testes**: Nenhum teste existente precisa ser alterado; os cenários da nova função podem ser testados em novo arquivo
