import React, { useState, useEffect } from 'react'
import { useSpeech } from '../../hooks/useSpeech'
import { useFeatureFlags } from '../../hooks/useFeatureFlags'
import './HelpButton.css'

const HELP_TIPS = {
  default: {
    title: 'Dica',
    text: 'Explore os módulos de aprendizado na tela inicial.',
  },
  dashboard: {
    title: 'Dashboard',
    text: 'Aqui você vê todos os módulos disponíveis. Clique em um módulo para começar a lição.',
  },
  lesson: {
    title: 'Lição',
    text: 'Digite a letra, sílaba ou palavra mostrada na tela. Use o teclado físico ou clique nas teclas virtuais.',
  },
  keyboard: {
    title: 'Teclado Virtual',
    text: 'Clique nas teclas com o mouse ou use o teclado do seu computador. As teclas destacam quando pressionadas.',
  },
  speech: {
    title: 'Fala',
    text: 'Clique no botão "Falar" e pronuncie a letra ou palavra em voz alta para praticar.',
  },
  profile: {
    title: 'Perfil',
    text: 'Veja seu progresso, conquistas e estatísticas de aprendizado.',
  },
}

export default function HelpButton({ context = 'default' }) {
  const [open, setOpen] = useState(false)
  const tip = HELP_TIPS[context] || HELP_TIPS.default
  const { speak, supported: ttsSupported } = useSpeech()
  const { isActive } = useFeatureFlags()

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  useEffect(() => {
    if (open && ttsSupported) {
      speak(`${tip.title}: ${tip.text}`)
    }
  }, [open, tip.title, tip.text, speak, ttsSupported])

  if (!isActive('feature_help_button')) return null

  return (
    <>
      <button
        className={`help-btn ${open ? 'help-btn-active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Ajuda"
        aria-expanded={open}
      >
        ?
      </button>
      {open && (
        <div className="help-tooltip card" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="help-tooltip-header">
            <span className="help-tooltip-icon">💡</span>
            <span className="help-tooltip-title">{tip.title}</span>
          </div>
          <p className="help-tooltip-text">{tip.text}</p>
          <button className="help-tooltip-close" onClick={() => setOpen(false)}>✕</button>
        </div>
      )}
    </>
  )
}
