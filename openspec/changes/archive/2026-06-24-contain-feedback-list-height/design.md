## Context

A página de lição (`Lesson.jsx`) renderiza um `feedback-list` que acumula feedbacks de teclado e fala ao longo da interação do usuário. Atualmente o estado armazena até 10 itens (via `Array.slice(-9)`), e a lista CSS não possui `max-height` nem `overflow`, fazendo com que o container cresça livremente e empurre o `VirtualKeyboard` para baixo. Em telas menores ou após várias interações, o teclado pode ficar parcialmente fora da viewport.

## Goals / Non-Goals

**Goals:**

- Impedir que o `feedback-list` ultrapasse **140px** de altura vertical
- Garantir que itens excedentes sejam acessíveis via scroll (`overflow-y: auto`)
- Manter o `VirtualKeyboard` e demais elementos abaixo da lista em posição fixa
- Reduzir o número máximo de itens armazenados em estado de 10 para 5
- Preservar todo o comportamento existente (exibição, cores, animações, acessibilidade)

**Non-Goals:**

- Não alterar a ordem de exibição dos itens (mais recente continua no final)
- Não modificar a aparência individual dos itens (cores, fontes, bordas)
- Não implementar auto-dismiss ou toast notifications
- Não alterar a lógica de `addFeedback` ou `tryExtractTarget`

## Decisions

### Decision 1: `max-height: 140px` em vez de unidade relativa

- **Escolha**: `140px` fixo
- **Alternativa considerada**: `max-height: 30vh` (viewport-relative)
- **Motivo**: 140px comporta ~5 itens, que é o novo limite do estado. Unidade fixa é mais previsível independente do tamanho da viewport. O valor foi calculado com base no tamanho típico de cada item (~28px: 0.85rem font + padding + border).

### Decision 2: Reduzir limite de estado de 10 para 5

- **Escolha**: `prev.slice(-4)` em vez de `prev.slice(-9)`
- **Alternativa considerada**: Manter 10 com scroll only
- **Motivo**: Reduzir o número de itens no estado diminui re-renderizações desnecessárias e o peso no DOM. Com `max-height: 140px`, apenas 5 itens são visíveis sem scroll, então armazenar mais que isso só aumenta o consumo de memória sem benefício visual imediato. O usuário ainda pode scrollar para ver itens anteriores.

### Decision 3: Scrollbar fina (`scrollbar-width: thin`)

- **Escolha**: `scrollbar-width: thin`
- **Alternativa considerada**: Sem scrollbar personalizada (padrão do navegador) ou esconder scrollbar (`scrollbar-width: none`)
- **Motivo**: Uma scrollbar fina é menos intrusiva visualmente, mas ainda sinaliza que há mais conteúdo. Esconder completamente sacrificaria a descoberta de itens antigos.

## Risks / Trade-offs

- **[UX] Itens antigos menos visíveis**: Com limite de 5 itens e max-height de 140px, feedbacks mais antigos saem do estado ou ficam fora da área visível sem scroll.
  - **Mitigação**: O scroll permite acessar itens anteriores. Feedbacks mais antigos são naturalmente menos relevantes que os recentes.
- **[Acessibilidade] Scroll dentro de região `aria-live`**: O `feedback-list` tem `aria-live="polite"`. Itens adicionados via scroll podem não ser anunciados por leitores de tela.
  - **Mitigação**: O atributo `aria-live` já anuncia novos itens quando são adicionados ao DOM. Itens que saíram da viewport por scroll não são novidade — já foram anunciados quando adicionados.
- **[Regressão] Layout quebrado em resoluções muito pequenas**: 140px pode ser muito ou pouco dependendo do viewport.
  - **Mitigação**: Testar em 768px (tablet) e 375px (mobile). Se necessário, ajustar para `max-height: 120px` ou usar `clamp()`.
