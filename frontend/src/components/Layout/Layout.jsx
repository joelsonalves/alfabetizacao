import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Layout.css'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
    </div>
  )
}
