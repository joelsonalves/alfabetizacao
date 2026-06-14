import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import Tutorial from '../pages/Tutorial'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Teste' },
  }),
}))

vi.mock('../hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    supported: true,
  }),
}))

vi.mock('../services/api', () => ({
  api: {
    auth: { me: () => Promise.resolve({ id: 1 }) },
  },
}))

describe('Tutorial page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders first step', () => {
    render(
      <MemoryRouter>
        <Tutorial />
      </MemoryRouter>
    )
    expect(screen.getByText('Bem-vindo!')).toBeInTheDocument()
    expect(screen.getByText('Passo 1 de 7')).toBeInTheDocument()
  })

  it('advances to next step on click', async () => {
    render(
      <MemoryRouter>
        <Tutorial />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByText('Próximo →'))
    await waitFor(() => {
      expect(screen.getByText('Passo 2 de 7')).toBeInTheDocument()
    })
  })

  it('shows "Começar!" on last step', async () => {
    render(
      <MemoryRouter>
        <Tutorial />
      </MemoryRouter>
    )

    for (let i = 0; i < 6; i++) {
      await userEvent.click(screen.getByText('Próximo →'))
    }

    await waitFor(() => {
      expect(screen.getByText('Começar!')).toBeInTheDocument()
    })
  })

  it('has skip button', () => {
    render(
      <MemoryRouter>
        <Tutorial />
      </MemoryRouter>
    )
    expect(screen.getByText('Pular Tutorial')).toBeInTheDocument()
  })

  it('renders progress dots', () => {
    render(
      <MemoryRouter>
        <Tutorial />
      </MemoryRouter>
    )
    const dots = document.querySelectorAll('.tutorial-dot')
    expect(dots).toHaveLength(7)
  })
})
