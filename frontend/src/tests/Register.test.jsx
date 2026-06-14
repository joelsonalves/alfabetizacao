import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import Register from '../pages/Register'

const mockRegister = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ register: mockRegister, user: null, loading: false }),
}))

const renderRegister = () => render(
  <MemoryRouter>
    <Register />
  </MemoryRouter>
)

describe('Register page', () => {
  it('renders form', () => {
    renderRegister()
    expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Crie uma senha')).toBeInTheDocument()
  })

  it('shows error for short password', async () => {
    renderRegister()

    await userEvent.type(screen.getByPlaceholderText('Seu nome'), 'Test')
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText('Crie uma senha'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }))

    await waitFor(() => {
      expect(screen.getByText(/pelo menos 6 caracteres/)).toBeInTheDocument()
    })
  })

  it('shows error on failed register', async () => {
    mockRegister.mockRejectedValue(new Error('Email já cadastrado'))
    renderRegister()

    await userEvent.type(screen.getByPlaceholderText('Seu nome'), 'Test')
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'existing@test.com')
    await userEvent.type(screen.getByPlaceholderText('Crie uma senha'), '123456')
    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }))

    await waitFor(() => {
      expect(screen.getByText('Email já cadastrado')).toBeInTheDocument()
    })
  })

  it('has link to login', () => {
    renderRegister()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })
})
