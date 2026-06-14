import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import HelpButton from '../HelpButton/HelpButton'
import './Layout.css'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const helpContext = location.pathname.includes('/lesson') ? 'lesson' :
    location.pathname.includes('/dashboard') ? 'dashboard' :
    location.pathname.includes('/profile') ? 'profile' :
    'default'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/dashboard" className="logo">
            <span className="logo-icon">📖</span>
            <span className="logo-text">Alfabetização</span>
          </Link>
          {user && (
            <nav className="nav">
              <Link to="/dashboard" className="nav-link">Início</Link>
              <Link to="/profile" className="nav-link">Perfil</Link>
              <Link to="/tutorial" className="nav-link">Ajuda</Link>
              <div className="nav-user">
                <span className="nav-xp">⭐ {user.xp} XP</span>
                <span className="nav-level">Nv. {user.level}</span>
                <button onClick={handleLogout} className="btn-logout">Sair</button>
              </div>
            </nav>
          )}
        </div>
      </header>
      <main className="main">
        {children}
      </main>
      <HelpButton context={helpContext} />
    </div>
  )
}
