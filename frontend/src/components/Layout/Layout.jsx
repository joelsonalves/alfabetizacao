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
      <a href="#main-content" className="skip-link">Pular para conteúdo principal</a>
      <header className="header">
        <div className="header-content">
          <Link to="/dashboard" className="logo" aria-label="Ir para o Início">
            <span className="logo-icon">📖</span>
            <span className="logo-text">Alfabetização</span>
          </Link>
          {user && (
            <nav className="nav">
              <Link to="/dashboard" className="nav-link" aria-label="Ir para o Início">🏠 Início</Link>
              <Link to="/profile" className="nav-link" aria-label="Ver Perfil">👤 Perfil</Link>
              <Link to="/tutorial" className="nav-link" aria-label="Ajuda">❓ Ajuda</Link>
              {user.is_admin && <Link to="/admin" className="nav-link" aria-label="Administração">⚙️ Admin</Link>}
              <div className="nav-user">
                <span className="nav-xp">⭐ {user.xp} XP</span>
                <span className="nav-level">Nv. {user.level}</span>
                <button onClick={handleLogout} className="btn-logout" aria-label="Sair do sistema">🔒 Sair</button>
              </div>
            </nav>
          )}
        </div>
      </header>
      <main id="main-content" className="main">
        {children}
      </main>
      <HelpButton context={helpContext} />
    </div>
  )
}
