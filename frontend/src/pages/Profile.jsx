import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import './Profile.css'

export default function Profile() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [definitions, setDefinitions] = useState({})
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.progress.achievements(),
      api.progress.get(),
      api.achievements.definitions().catch(() => []),
    ]).then(([ach, prog, defs]) => {
      setAchievements(ach)
      setProgress(prog)
      const defMap = {}
      defs.forEach(d => { defMap[d.achievement_type] = d })
      setDefinitions(defMap)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalStars = progress.reduce((sum, p) => sum + p.stars, 0)
  const completedLessons = progress.filter(p => p.completed).length
  const totalCompleted = completedLessons

  return (
    <div className="profile fade-in">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase() || '👤'}
        </div>
        <div className="profile-info">
          <h1>{user?.name}</h1>
          <p className="profile-email">{user?.email}</p>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat-card card">
          <span className="profile-stat-icon">⭐</span>
          <span className="profile-stat-value">{user?.xp || 0}</span>
          <span className="profile-stat-label">XP Total</span>
        </div>
        <div className="profile-stat-card card">
          <span className="profile-stat-icon">🏆</span>
          <span className="profile-stat-value">{user?.level || 1}</span>
          <span className="profile-stat-label">Nível</span>
        </div>
        <div className="profile-stat-card card">
          <span className="profile-stat-icon">⭐</span>
          <span className="profile-stat-value">{totalStars}</span>
          <span className="profile-stat-label">Estrelas</span>
        </div>
        <div className="profile-stat-card card">
          <span className="profile-stat-icon">✅</span>
          <span className="profile-stat-value">{totalCompleted}</span>
          <span className="profile-stat-label">Lições</span>
        </div>
        <div className="profile-stat-card card">
          <span className="profile-stat-icon">🔥</span>
          <span className="profile-stat-value">{user?.streak || 0}</span>
          <span className="profile-stat-label">Sequência</span>
        </div>
      </div>

      <div className="profile-section">
        <h2>Conquistas</h2>
        {loading ? (
          <p className="loading-text">Carregando...</p>
        ) : achievements.length === 0 ? (
          <p className="empty-text">Nenhuma conquista ainda. Continue praticando!</p>
        ) : (
          <div className="achievements-grid">
            {achievements.map(ach => {
              const def = definitions[ach.achievement_type]
              return (
                <div key={ach.id} className="achievement-card card">
                  <span className="achievement-icon">{def?.icon || '🏅'}</span>
                  <span className="achievement-name">{def?.name || ach.achievement_type}</span>
                  {def?.description && <span className="achievement-desc">{def.description}</span>}
                  <span className="achievement-date">{new Date(ach.unlocked_at).toLocaleDateString('pt-BR')}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
