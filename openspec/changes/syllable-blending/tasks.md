## 1. Backend: Seed data para blending

- [ ] 1.1 Adicionar módulo `blending` em `backend/app/seed.py` entre módulo 4 (Sílabas Complexas) e módulo 5 (Palavras), com `module_type: "blending"` e `sort_order` ajustado
- [ ] 1.2 Criar lista de palavras de 2-4 sílabas como lições `blending`, cada uma com `content` JSON contendo `syllables` e `word`
- [ ] 1.3 Rodar `seed.py` e verificar no banco que o módulo e lições foram criados corretamente
- [ ] 1.4 Rodar `pytest` e confirmar que todos os testes existentes continuam passando

## 2. Frontend: Componente SyllableBlending

- [ ] 2.1 Criar `src/components/SyllableBlending/SyllableBlending.jsx` com container, progresso, alvo atual, e botão de fala
- [ ] 2.2 Criar `src/components/SyllableBlending/SyllableBlending.css` com estilos: container, progresso, target, step-done, ações, completado
- [ ] 2.3 Implementar máquina de estados (steps: sílabas + palavra final) e transição automática ao completar cada etapa
- [ ] 2.4 Integrar `useSpeechRecognition` por etapa, com `timeoutMs` variável (4s sílaba, 10s palavra)
- [ ] 2.5 Integrar `useKeyboard` por etapa, resetando target a cada transição
- [ ] 2.6 Implementar lógica de "ambos necessários" (speech AND keyboard) para avançar
- [ ] 2.7 Implementar indicador visual de progresso (ex: "Sílaba 1 de 2", "✅ PA • ⏳ TO • ⬜ PATO")
- [ ] 2.8 Botão de fala com toggle "🎤 Ler em voz alta [1]" / "🛑 Terminei de ler [1]", badge numérico, `min-width: 200px`
- [ ] 2.9 Estados de completed (exibir "✅ PA" no progresso) e "concluído" (palavra final acertada)

## 3. Frontend: Integração em Lesson.jsx

- [ ] 3.1 Adicionar `"blending"` em `LESSON_TYPE_REQUIRES_SPEECH` e `SPEECH_TYPE_NAMES`
- [ ] 3.2 Adicionar `POINTS["blending"] = 60`
- [ ] 3.3 Adicionar `SPEECH_TIMEOUTS["blending"] = 20_000` (timeout geral; componente controla timeout interno)
- [ ] 3.4 Renderizar `<SyllableBlending>` quando `lesson_type === "blending"`, passando `lesson` e `onComplete`
- [ ] 3.5 Dinamizar `checklistItems` para blending: `"Ler Sílaba 1 (PA)"`, `"Ler Sílaba 2 (TO)"`, `"Ler Palavra (PATO)"`
- [ ] 3.6 Garantir que `handleComplete` (progress mutation) funciona com blending

## 4. Testes

- [ ] 4.1 Testar manualmente no navegador: abrir lição blending, passar por todas as etapas (fala + teclado), verificar progresso e pontuação
- [ ] 4.2 Rodar `npm test` e confirmar que todos os 122 testes existentes continuam passando
- [ ] 4.3 Escrever testes unitários para o componente SyllableBlending (renderização inicial, transição entre etapas, chamada de onComplete)
