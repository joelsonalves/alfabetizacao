import React, { useEffect } from 'react'
import './LevelUp.css'

export default function LevelUp({ level, xp, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="levelup-overlay" onClick={onClose}>
      <div className="levelup-card slide-up" onClick={e => e.stopPropagation()}>
        <div className="levelup-stars">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="levelup-star" style={{ animationDelay: `${i * 0.2}s` }}>
              ⭐
            </span>
          ))}
        </div>
        <h2 className="levelup-title">Subiu de Nível!</h2>
        <div className="levelup-level">Nível {level}</div>
        <p className="levelup-text">Parabéns! Você está avançando cada vez mais!</p>
        <div className="levelup-xp">XP Total: {xp}</div>
        <button className="btn btn-primary levelup-btn" onClick={onClose}>
          Continuar
        </button>
      </div>
    </div>
  )
}
