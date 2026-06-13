## 1. Infraestrutura Docker

- [ ] 1.1 Criar docker-compose.yml com PostgreSQL, backend e frontend
- [ ] 1.2 Criar Dockerfile para o backend (FastAPI + Python)
- [ ] 1.3 Criar Dockerfile para o frontend (Nginx + React build)
- [ ] 1.4 Criar nginx.conf com proxy reverso para API
- [ ] 1.5 Criar .env.example com variáveis de ambiente

## 2. Backend: Setup e Models

- [ ] 2.1 Criar estrutura do projeto FastAPI (app/main.py, config, database)
- [ ] 2.2 Criar models SQLAlchemy: User, LearningModule, Lesson, UserProgress, Achievement, Session
- [ ] 2.3 Criar schemas Pydantic para validação
- [ ] 2.4 Configurar Alembic para migrations
- [ ] 2.5 Criar script de seed com conteúdo dos 7 níveis de aprendizado

## 3. Backend: Autenticação

- [ ] 3.1 Implementar rota POST /api/auth/register
- [ ] 3.2 Implementar rota POST /api/auth/login com JWT
- [ ] 3.3 Implementar middleware de autenticação JWT
- [ ] 3.4 Implementar rota GET /api/auth/me

## 4. Backend: Módulos e Progresso

- [ ] 4.1 Implementar rotas GET /api/modules e GET /api/modules/{id}/lessons
- [ ] 4.2 Implementar rota GET /api/lessons/{id}
- [ ] 4.3 Implementar rota POST /api/progress/lesson/{id} (salvar progresso)
- [ ] 4.4 Implementar rota GET /api/progress (recuperar progresso do usuário)
- [ ] 4.5 Implementar rota GET /api/achievements
- [ ] 4.6 Implementar rota GET /api/images/{type}/{reference}

## 5. Frontend: Setup

- [ ] 5.1 Inicializar projeto React + Vite
- [ ] 5.2 Configurar tema de cores (paleta suave e anti-distração)
- [ ] 5.3 Criar layout base com header, footer e navegação
- [ ] 5.4 Configurar React Router com rotas públicas e protegidas

## 6. Frontend: Autenticação

- [ ] 6.1 Criar página de Login
- [ ] 6.2 Criar página de Cadastro
- [ ] 6.3 Implementar AuthContext com JWT persistido
- [ ] 6.4 Criar hook useAuth para componentes
- [ ] 6.5 Criar componente de rota protegida

## 7. Frontend: Teclado Virtual

- [ ] 7.1 Criar componente VirtualKeyboard com layout ABNT2
- [ ] 7.2 Implementar detecção de teclado físico com hook useKeyboard
- [ ] 7.3 Implementar highlight da tecla pressionada com animação
- [ ] 7.4 Suportar clique nas teclas virtuais

## 8. Frontend: Áudio e Fala

- [ ] 8.1 Implementar hook useSpeech com Web Speech API (TTS em PT-BR)
- [ ] 8.2 Implementar detecção e seleção de voz PT-BR
- [ ] 8.3 Tocar som da letra ao pressionar tecla
- [ ] 8.4 Tocar som da sílaba ao formar combinação
- [ ] 8.5 Tocar som da palavra/frase ao completar
- [ ] 8.6 Implementar hook useSpeechRecognition para microfone

## 9. Frontend: Módulos de Aprendizado

- [ ] 9.1 Criar página Dashboard com visão geral dos módulos
- [ ] 9.2 Criar componente Lesson para cada tipo (letra, sílaba, palavra, frase)
- [ ] 9.3 Implementar Level 1: Vogais (A, E, I, O, U)
- [ ] 9.4 Implementar Level 2: Consoantes com imagens emoji
- [ ] 9.5 Implementar Level 3: Sílabas Simples (CV) com imagens
- [ ] 9.6 Implementar Level 4: Sílabas Complexas
- [ ] 9.7 Implementar Level 5: Palavras com imagens reais
- [ ] 9.8 Implementar Level 6: Frases com cenas
- [ ] 9.9 Implementar Level 7: Orações completas

## 10. Frontend: Gamificação

- [ ] 10.1 Implementar sistema de pontos por ação
- [ ] 10.2 Implementar sistema de estrelas por lição
- [ ] 10.3 Implementar componente ProgressBar visual
- [ ] 10.4 Implementar sistema de streaks diários
- [ ] 10.5 Implementar conquistas/achievements
- [ ] 10.6 Implementar animação de level-up

## 11. Frontend: Tutorial

- [ ] 11.1 Criar componente de tutorial guiado com passos
- [ ] 11.2 Implementar narração em áudio para cada passo
- [ ] 11.3 Implementar highlight contextual dos elementos
- [ ] 11.4 Implementar replay do tutorial
- [ ] 11.5 Adicionar botão de ajuda com tooltips contextuais

## 12. Frontend: Imagens Multissensoriais

- [ ] 12.1 Mapear emojis para cada consoante (A-Z)
- [ ] 12.2 Implementar busca de imagens via Unsplash API para palavras/frases
- [ ] 12.3 Implementar cache de imagens no backend
- [ ] 12.4 Implementar fallback para SVG/emoji quando sem conexão

## 13. Integração e Testes

- [ ] 13.1 Conectar frontend com backend (serviço API)
- [ ] 13.2 Testar fluxo completo: cadastro → login → progressão
- [ ] 13.3 Testar TTS em diferentes navegadores
- [ ] 13.4 Testar Speech Recognition em diferentes navegadores
- [ ] 13.5 Validar fluxo Docker Compose completo
