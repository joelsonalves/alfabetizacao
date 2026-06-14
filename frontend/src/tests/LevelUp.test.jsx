import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import LevelUp from '../components/LevelUp/LevelUp'

describe('LevelUp', () => {
  it('renders level and xp', () => {
    render(<LevelUp level={3} xp={1500} onClose={() => {}} />)
    expect(screen.getByText('Nível 3')).toBeInTheDocument()
    expect(screen.getByText('XP Total: 1500')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<LevelUp level={1} xp={500} onClose={() => {}} />)
    expect(screen.getByText('Subiu de Nível!')).toBeInTheDocument()
  })

  it('calls onClose when clicking overlay', async () => {
    const onClose = vi.fn()
    render(<LevelUp level={1} xp={500} onClose={onClose} />)
    await userEvent.click(screen.getByText('Continuar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose when clicking card (stopPropagation)', async () => {
    const onClose = vi.fn()
    render(<LevelUp level={1} xp={500} onClose={onClose} />)
    await userEvent.click(screen.getByText('Subiu de Nível!'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders 3 stars', () => {
    render(<LevelUp level={1} xp={500} onClose={() => {}} />)
    const stars = screen.getAllByText('⭐')
    expect(stars).toHaveLength(3)
  })
})
