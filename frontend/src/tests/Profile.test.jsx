import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import Profile from '../pages/Profile'

const mockAchievements = [
  { id: 1, achievement_type: 'primeira_letra', unlocked_at: '2024-01-01' },
  { id: 2, achievement_type: 'perfeito', unlocked_at: '2024-01-02' },
]

let mockAchievementsData = mockAchievements

vi.mock('../services/api', () => ({
  api: {
    progress: {
      achievements: () => Promise.resolve(mockAchievementsData),
      get: () => Promise.resolve([
        { lesson_id: 1, stars: 3, completed: true },
        { lesson_id: 2, stars: 2, completed: true },
        { lesson_id: 3, stars: 0, completed: false },
      ]),
    },
  },
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Maria', email: 'maria@teste.com', level: 2, xp: 350, streak: 5 },
  }),
}))

describe('Profile page', () => {
  it('renders user info', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Maria')).toBeInTheDocument()
    })
    expect(screen.getByText('maria@teste.com')).toBeInTheDocument()
  })

  it('renders stats', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('350')).toBeInTheDocument()
    })
    const twos = screen.getAllByText('2')
    expect(twos).toHaveLength(2)
    const fives = screen.getAllByText('5')
    expect(fives).toHaveLength(2)
  })

  it('renders achievements', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('primeira_letra')).toBeInTheDocument()
    })
    expect(screen.getByText('perfeito')).toBeInTheDocument()
  })

  it('shows empty state when no achievements', async () => {
    mockAchievementsData = []
    render(<MemoryRouter><Profile /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma conquista/)).toBeInTheDocument()
    })
  })
})
