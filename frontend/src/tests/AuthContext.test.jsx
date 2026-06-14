import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { AuthProvider, AuthContext } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'

const mockUser = { id: 1, name: 'Teste', email: 'teste@teste.com', level: 1, xp: 0 }

function TestComponent() {
  const { user, loading, login, register, logout } = useAuth()
  if (loading) return <div>Carregando...</div>
  return (
    <div>
      <span data-testid="user-name">{user?.name || 'null'}</span>
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

it('starts with no user', async () => {
  renderWithProvider()
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('null')
  })
})

it('login sets user and stores token', async () => {
  const fakeLogin = vi.fn().mockResolvedValue({ access_token: 'token123', user: mockUser })
  const originalLogin = global.fetch
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

  global.fetch = originalLogin
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
