import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSpeech } from '../hooks/useSpeech'
import { api } from '../services/api'
import './Tutorial.css'

const STEPS = [
  {
    title: 'Bem-vindo!',
    text: 'Este sistema vai ajudar você a aprender a ler enquanto aprende a digitar. Vamos fazer um tour rápido!',
    icon: '👋',
    highlight: '',
  },
  {
    title: 'Os Módulos',
    text: 'Na tela inicial você vê os 7 módulos de aprendizado: Vogais, Consoantes, Sílabas Simples, Sílabas Complexas, Palavras, Frases e Orações.',
    icon: '📚',
    highlight: 'module-grid',
  },
  {
    title: 'Teclado Virtual',
    text: 'Quando estiver em uma lição, um teclado virtual aparece na tela. Você pode digitar no teclado físico do seu computador ou clicar nas teclas na tela.',
    icon: '⌨️',
    highlight: 'virtual-keyboard',
  },
  {
    title: 'Som e Imagem',
    text: 'Cada letra tem um som! Quando você pressiona uma tecla, o sistema lê a letra em voz alta. Consoantes têm imagens divertidas para ajudar a memorizar.',
    icon: '🔊',
    highlight: 'lesson-image',
  },
  {
    title: 'Fale Também!',
    text: 'Você pode usar o microfone para praticar a pronúncia. Clique no botão "Falar" e diga a letra ou palavra em voz alta!',
    icon: '🎤',
    highlight: 'speech-btn',
  },
  {
    title: 'Progresso e Gamificação',
    text: 'Você ganha pontos por cada acerto, estrelas por lição completa e conquistas especiais. Mantenha uma sequência de dias para ganhar bônus!',
    icon: '⭐',
    highlight: 'dashboard-stats',
  },
  {
    title: 'Pronto para Começar!',
    text: 'Agora você já sabe tudo! Vamos começar? Clique em "Ir para o Dashboard" e escolha seu primeiro módulo.',
    icon: '🚀',
    highlight: '',
  },
]

export default function Tutorial() {
  const [step, setStep] = useState(0)
  const [show, setShow] = useState(true)
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const { speak, supported } = useSpeech()

  const currentStep = STEPS[step]

  useEffect(() => {
    if (supported && currentStep) {
      speak(currentStep.text)
    }
  }, [step, supported, speak, currentStep])

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      handleFinish()
    }
  }, [step])

  const handleFinish = async () => {
    setShow(false)
    try {
      await api.auth.me()
    } catch {}
    navigate('/dashboard')
  }

  const handleSkip = () => {
    setShow(false)
    navigate('/dashboard')
  }

  if (!show) return null

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card card slide-up">
        <div className="tutorial-progress">
          {STEPS.map((_, i) => (
            <div key={i} className={`tutorial-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
          ))}
        </div>

        <div className="tutorial-icon">{currentStep.icon}</div>
        <h2 className="tutorial-title">{currentStep.title}</h2>
        <p className="tutorial-text">{currentStep.text}</p>

        <div className="tutorial-actions">
          <button className="btn btn-secondary" onClick={handleSkip}>
            Pular Tutorial
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            {step < STEPS.length - 1 ? 'Próximo →' : 'Começar!'}
          </button>
        </div>

        <div className="tutorial-step-info">
          Passo {step + 1} de {STEPS.length}
        </div>
      </div>
    </div>
  )
}
