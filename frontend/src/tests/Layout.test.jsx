import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import Layout from '../components/Layout/Layout'

const mockLogout = vi.fn()
const mockNavigate = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

afterEach(() => {
  mockLogout.mockClear()
  mockNavigate.mockClear()
})

describe('Layout', () => {
  it('renders navigation when user is logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Teste', level: 2, xp: 350 },
      logout: mockLogout,
    })

    render(<MemoryRouter><Layout><div>Conteúdo</div></Layout></MemoryRouter>)

    expect(screen.getByText(/Início/)).toBeInTheDocument()
    expect(screen.getByText(/Perfil/)).toBeInTheDocument()
    expect(screen.getByText(/Ajuda/)).toBeInTheDocument()
    expect(screen.getByText(/Sair/)).toBeInTheDocument()
    expect(screen.getByText(/350 XP/)).toBeInTheDocument()
    expect(screen.getByText(/Nv\. 2/)).toBeInTheDocument()
  })

  it('renders children', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Teste', level: 1, xp: 0 },
      logout: mockLogout,
    })

    render(<MemoryRouter><Layout><div>Conteúdo</div></Layout></MemoryRouter>)

    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  it('has skip link pointing to main-content', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Teste', level: 1, xp: 0 },
      logout: mockLogout,
    })

    render(<MemoryRouter><Layout><div>Conteúdo</div></Layout></MemoryRouter>)

    const skipLink = screen.getByText('Pular para conteúdo principal')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('hides navigation when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    })

    render(<MemoryRouter><Layout><div>Conteúdo</div></Layout></MemoryRouter>)

    expect(screen.queryByText(/Início/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Perfil/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Sair/)).not.toBeInTheDocument()
  })

  it('calls logout and navigates on logout click', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Teste', level: 1, xp: 0 },
      logout: mockLogout,
    })

    render(<MemoryRouter><Layout><div>Conteúdo</div></Layout></MemoryRouter>)

    await userEvent.click(screen.getByText(/Sair/))
    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
