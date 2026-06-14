## 1. Infraestrutura Docker

- [x] 1.1 Criar docker-compose.yml com PostgreSQL, backend e frontend
- [x] 1.2 Criar Dockerfile para o backend (FastAPI + Python)
- [x] 1.3 Criar Dockerfile para o frontend (Nginx + React build)
- [x] 1.4 Criar nginx.conf com proxy reverso para API
- [x] 1.5 Criar .env.example com variáveis de ambiente

## 2. Backend: Setup e Models

- [x] 2.1 Criar estrutura do projeto FastAPI (app/main.py, config, database)
- [x] 2.2 Criar models SQLAlchemy: User, LearningModule, Lesson, UserProgress, Achievement, Session
- [x] 2.3 Criar schemas Pydantic para validação
- [x] 2.4 Configurar Alembic para migrations
- [x] 2.5 Criar script de seed com conteúdo dos 7 níveis de aprendizado

## 3. Backend: Autenticação

- [x] 3.1 Implementar rota POST /api/auth/register
- [x] 3.2 Implementar rota POST /api/auth/login com JWT
- [x] 3.3 Implementar middleware de autenticação JWT
- [x] 3.4 Implementar rota GET /api/auth/me

## 4. Backend: Módulos e Progresso

- [x] 4.1 Implementar rotas GET /api/modules e GET /api/modules/{id}/lessons
- [x] 4.2 Implementar rota GET /api/lessons/{id}
- [x] 4.3 Implementar rota POST /api/progress/lesson/{id} (salvar progresso)
- [x] 4.4 Implementar rota GET /api/progress (recuperar progresso do usuário)
- [x] 4.5 Implementar rota GET /api/achievements
- [x] 4.6 Implementar rota GET /api/images/{type}/{reference}

## 5. Frontend: Setup

- [x] 5.1 Inicializar projeto React + Vite
- [x] 5.2 Configurar tema de cores (paleta suave e anti-distração)
- [x] 5.3 Criar layout base com header, footer e navegação
- [x] 5.4 Configurar React Router com rotas públicas e protegidas

## 6. Frontend: Autenticação

- [x] 6.1 Criar página de Login
- [x] 6.2 Criar página de Cadastro
- [x] 6.3 Implementar AuthContext com JWT persistido
- [x] 6.4 Criar hook useAuth para componentes
- [x] 6.5 Criar componente de rota protegida

## 7. Frontend: Teclado Virtual

- [x] 7.1 Criar componente VirtualKeyboard com layout ABNT2
- [x] 7.2 Implementar detecção de teclado físico com hook useKeyboard
- [x] 7.3 Implementar highlight da tecla pressionada com animação
- [x] 7.4 Suportar clique nas teclas virtuais
- [x] 7.5 Adicionar state lastWrongKey no hook useKeyboard para feedback visual de erro

## 8. Frontend: Áudio e Fala

- [x] 8.1 Implementar hook useSpeech com Web Speech API (TTS em PT-BR)
- [x] 8.2 Implementar detecção e seleção de voz PT-BR
- [x] 8.3 Tocar som da letra ao pressionar tecla
- [x] 8.4 Tocar som da sílaba ao formar combinação
- [x] 8.5 Tocar som da palavra/frase ao completar
- [x] 8.6 Implementar hook useSpeechRecognition para microfone
- [x] 8.7 Melhorar speakLetterWithWord: formato "A → de Abelha." (seta + capitalização)
- [x] 8.8 Corrigir TTS para não falar "→" como "seta" e sincronizar checklist com speakLetterWithWord

## 9. Frontend: Módulos de Aprendizado

- [x] 9.1 Criar página Dashboard com visão geral dos módulos
- [x] 9.2 Criar componente Lesson para cada tipo (letra, sílaba, palavra, frase)
- [x] 9.3 Implementar Level 1: Vogais (A, E, I, O, U)
- [x] 9.4 Implementar Level 2: Consoantes com imagens emoji
- [x] 9.5 Implementar Level 3: Sílabas Simples (CV) com imagens
- [x] 9.6 Implementar Level 4: Sílabas Complexas
- [x] 9.7 Implementar Level 5: Palavras com imagens reais
- [x] 9.8 Implementar Level 6: Frases com cenas
- [x] 9.9 Implementar Level 7: Orações completas
- [x] 9.10 Exibir feedback visual de tecla errada na lição (Lesson.jsx + Lesson.css)

## 10. Frontend: Gamificação

- [x] 10.1 Implementar sistema de pontos por ação
- [x] 10.2 Implementar sistema de estrelas por lição
- [x] 10.3 Implementar componente ProgressBar visual
- [x] 10.4 Implementar sistema de streaks diários
- [x] 10.5 Implementar conquistas/achievements
- [x] 10.6 Implementar animação de level-up

## 11. Frontend: Tutorial

- [x] 11.1 Criar página de tutorial guiado com passos
- [x] 11.2 Implementar narração em áudio para cada passo
- [x] 11.3 Implementar highlight contextual dos elementos
- [x] 11.4 Implementar replay do tutorial
- [x] 11.5 Adicionar botão de ajuda com tooltips contextuais

## 12. Frontend: Imagens Multissensoriais

- [x] 12.1 Mapear emojis para cada consoante (A-Z)
- [x] 12.2 Implementar busca de imagens via Unsplash API para palavras/frases
- [x] 12.3 Implementar cache de imagens no backend
- [x] 12.4 Implementar fallback para SVG/emoji quando sem conexão

## 14. Ajustes de Feedback

- [ ] 14.1 Revisão de vogais: construir frase única em vez de setTimeout para não cortar fala
- [ ] 14.2 Desabilitar botões Ouvir e Fale enquanto sistema estiver falando (isSpeaking)
- [ ] 14.3 Unificar feedbacks de teclado e fala numa lista acima do VirtualKeyboard
- [ ] 14.4 Remover marcação incorreta de lições anteriores como concluídas na navegação
- [ ] 14.5 Corrigir W de lobo → W de waffle (useSpeech.js + images.py)

- [x] 13.1 Conectar frontend com backend (serviço API)
- [x] 13.2 Testar fluxo completo: cadastro → login → progressão
- [ ] 13.3 Testar TTS em diferentes navegadores (requer navegador real com Web Speech API)
- [ ] 13.4 Testar Speech Recognition em diferentes navegadores (requer navegador real com Web Speech API)
- [x] 13.5 Validar fluxo Docker Compose completo
