import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import Login from '../pages/Login'

const mockLogin = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin, user: null, loading: false }),
}))

const renderLogin = () => render(
  <MemoryRouter>
    <Login />
  </MemoryRouter>
)

describe('Login page', () => {
  it('renders form', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument()
  })

  it('shows error on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Email ou senha inválidos'))
    renderLogin()

    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText('Sua senha'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Email ou senha inválidos')).toBeInTheDocument()
    })
  })

  it('disables button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}))
    renderLogin()

    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText('Sua senha'), '123456')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('has link to register', () => {
    renderLogin()
    expect(screen.getByText('Cadastre-se')).toBeInTheDocument()
  })
})
