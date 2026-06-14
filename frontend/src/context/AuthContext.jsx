import React, { createContext, useState, useEffect } from 'react'
import { api } from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refresh_token')
    if (token && refreshToken) {
      api.auth.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
        })
        .finally(() => setLoading(false))
    } else if (refreshToken) {
      api.auth.refresh(refreshToken)
        .then((res) => {
          localStorage.setItem('token', res.access_token)
          localStorage.setItem('refresh_token', res.refresh_token)
          localStorage.setItem('user', JSON.stringify(res.user))
          setUser(res.user)
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (data) => {
    const res = await api.auth.login(data)
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('refresh_token', res.refresh_token)
    localStorage.setItem('user', JSON.stringify(res.user))
    setUser(res.user)
    return res
  }

  const register = async (data) => {
    const res = await api.auth.register(data)
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('refresh_token', res.refresh_token)
    localStorage.setItem('user', JSON.stringify(res.user))
    setUser(res.user)
    return res
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      try {
        await api.auth.logout(refreshToken)
      } catch {
        // ignore errors on logout
      }
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
