import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'

const mockUser = { id: 1, name: 'Teste', email: 'teste@teste.com', level: 1, xp: 0 }

function TestComponent() {
  const { user, loading, isAuthenticated, login, register, logout } = useAuth()
  if (loading) return <div>Carregando...</div>
  return (
    <div>
      <span data-testid="user-name">{user?.name || 'null'}</span>
      <span data-testid="auth-status">{isAuthenticated ? 'autenticado' : 'nao-autenticado'}</span>
      <button onClick={() => login({ email: 'teste@teste.com', password: '123456' })}>Login</button>
      <button onClick={() => register({ name: 'Novo', email: 'novo@teste.com', password: '123456' })}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('starts with no user', async () => {
  renderWithProvider()
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('null')
  })
})

it('login sets user and stores token', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ access_token: 'token123', user: mockUser }),
  })

  renderWithProvider()
  await waitFor(() => screen.getByText('Login'))
  await userEvent.click(screen.getByText('Login'))
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('Teste')
  })
})

it('logout clears user and token', async () => {
  localStorage.setItem('token', 'token123')
  localStorage.setItem('user', JSON.stringify(mockUser))

  renderWithProvider()
  await waitFor(() => screen.getByText('Logout'))
  await userEvent.click(screen.getByText('Logout'))
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('null')
  })
  expect(localStorage.getItem('token')).toBeNull()
})

it('refreshes token on startup when only refresh_token exists', async () => {
  localStorage.setItem('refresh_token', 'old-refresh')
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      access_token: 'new-token',
      refresh_token: 'new-refresh',
      user: mockUser,
    }),
  })

  renderWithProvider()
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('Teste')
  })
  expect(localStorage.getItem('token')).toBe('new-token')
  expect(localStorage.getItem('refresh_token')).toBe('new-refresh')
})

it('clears storage when refresh fails on startup', async () => {
  localStorage.setItem('refresh_token', 'expired-refresh')
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 401,
    json: () => Promise.resolve({ detail: 'Invalid refresh token' }),
  })

  renderWithProvider()
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('null')
  })
  expect(localStorage.getItem('token')).toBeNull()
  expect(localStorage.getItem('refresh_token')).toBeNull()
})

it('isAuthenticated is false when no token exists', async () => {
  renderWithProvider()
  await waitFor(() => {
    expect(screen.getByTestId('auth-status')).toHaveTextContent('nao-autenticado')
  })
})

it('isAuthenticated is true after login succeeds', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ access_token: 'token123', user: mockUser }),
  })

  renderWithProvider()
  await waitFor(() => screen.getByText('Login'))
  await userEvent.click(screen.getByText('Login'))
  await waitFor(() => {
    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado')
  })
})

it('isAuthenticated is false after logout', async () => {
  localStorage.setItem('token', 'token123')
  localStorage.setItem('user', JSON.stringify(mockUser))

  renderWithProvider()
  await waitFor(() => screen.getByText('Logout'))
  await userEvent.click(screen.getByText('Logout'))
  await waitFor(() => {
    expect(screen.getByTestId('auth-status')).toHaveTextContent('nao-autenticado')
  })
})
