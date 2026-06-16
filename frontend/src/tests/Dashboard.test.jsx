import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import Dashboard from '../pages/Dashboard'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockModules = [
  { id: 1, name: 'Vogais', module_type: 'vowel', description: 'Aprenda as vogais', sort_order: 1 },
  { id: 2, name: 'Consoantes', module_type: 'consonant', description: 'Aprenda as consoantes', sort_order: 2 },
]

const mockLessons = [
  { id: 1, module_id: 1, name: 'Vogal A', lesson_type: 'letter', target: 'A', sort_order: 1 },
]

let mockProgressGet = vi.fn().mockResolvedValue([])

vi.mock('../services/api', () => ({
  api: {
    modules: {
      list: () => Promise.resolve(mockModules),
      lessons: (id) => Promise.resolve(id === 1 ? mockLessons : []),
    },
    progress: {
      get: (...args) => mockProgressGet(...args),
    },
  },
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Teste', level: 1, xp: 100, streak: 3 },
  }),
}))

describe('Dashboard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockProgressGet = vi.fn().mockResolvedValue([])
  })

  it('renders user greeting', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/Olá, Teste/)).toBeInTheDocument()
    })
  })

  it('renders modules', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Vogais')).toBeInTheDocument()
    })
    expect(screen.getByText('Consoantes')).toBeInTheDocument()
  })

  it('renders user stats', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Nv. 1')).toBeInTheDocument()
    })
  })

  it('navigates to first lesson when module clicked', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Vogais')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByText('Vogais'))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/lesson/1/1')
    })
  })

  it('does not navigate when module has no lessons', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Consoantes')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByText('Consoantes'))
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  it('shows error message when progress fetch fails', async () => {
    mockProgressGet = vi.fn().mockRejectedValue(new Error('Erro de autenticação. Faça login novamente.'))
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/Erro de autenticação/)).toBeInTheDocument()
    })
  })

  it('renders modules even when progress fetch fails', async () => {
    mockProgressGet = vi.fn().mockRejectedValue(new Error('Erro de autenticação'))
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Vogais')).toBeInTheDocument()
    })
    expect(screen.getByText('Consoantes')).toBeInTheDocument()
  })
})
