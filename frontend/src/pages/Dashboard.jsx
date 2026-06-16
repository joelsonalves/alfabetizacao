import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import './Dashboard.css'

const MODULE_ICONS = {
  vowel: '🔤', consonant: '🔠', simple_syllable: '🔡',
  complex_syllable: '📚', word: '📝', phrase: '💬', sentence: '📖',
}

export default function Dashboard() {
  const [modules, setModules] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const [progressError, setProgressError] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.modules.list().catch((err) => { setProgressError(err.message); return [] }),
      api.progress.get().catch((err) => { setProgressError(err.message); return [] }),
    ]).then(([mods, prog]) => {
      setModules(mods)
      const progMap = {}
      if (Array.isArray(prog)) {
        prog.forEach(p => { progMap[p.lesson_id] = p })
      }
      setProgress(progMap)
    }).finally(() => setLoading(false))
  }, [])

  const startLesson = async (module) => {
    try {
      const lessons = await api.modules.lessons(module.id)
      if (lessons.length === 0) return
      const firstIncomplete = lessons.find(l => !progress[l.id]?.completed) || lessons[0]
      navigate(`/lesson/${module.id}/${firstIncomplete.id}`)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Olá, {user?.name}! 👋</h1>
          <p>Continue de onde parou ou escolha um módulo abaixo</p>
        </div>
        <div className="dashboard-stats">
          <div className="stat"><span className="stat-value">⭐ {user?.xp}</span><span className="stat-label">XP</span></div>
          <div className="stat"><span className="stat-value">Nv. {user?.level}</span><span className="stat-label">Nível</span></div>
          <div className="stat"><span className="stat-value">🔥 {user?.streak || 0}</span><span className="stat-label">Dias</span></div>
        </div>
      </div>

      {progressError && (
        <div className="notification notification-error">
          ⚠️ {progressError}
          <button className="btn btn-ghost" onClick={() => navigate('/login')} style={{ marginLeft: 12 }}>
            Faça login novamente
          </button>
        </div>
      )}

      <div className="module-grid">
        {modules.map((mod, idx) => {
          const modLessons = mod.lessons?.length || 0
          const modCompleted = 0
          const icon = MODULE_ICONS[mod.module_type] || '📘'
          return (
            <button key={mod.id} className="module-card card" onClick={() => startLesson(mod)}>
              <span className="module-icon">{icon}</span>
              <div className="module-info">
                <h3>{mod.name}</h3>
                <p>{mod.description}</p>
              </div>
              <span className="module-level">Nível {mod.sort_order}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
