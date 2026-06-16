import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import HelpButton from '../components/HelpButton/HelpButton'

vi.mock('../hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    supported: false,
  }),
}))

describe('HelpButton', () => {
  it('renders help button', () => {
    render(<HelpButton />)
    expect(screen.getByRole('button', { name: 'Ajuda' })).toBeInTheDocument()
  })

  it('starts with aria-expanded false', () => {
    render(<HelpButton />)
    expect(screen.getByRole('button', { name: 'Ajuda' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles tooltip on click', async () => {
    render(<HelpButton context="dashboard" />)

    const btn = screen.getByRole('button', { name: 'Ajuda' })
    await userEvent.click(btn)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(btn)
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows correct tip for lesson context', async () => {
    render(<HelpButton context="lesson" />)

    await userEvent.click(screen.getByRole('button', { name: 'Ajuda' }))
    expect(screen.getByText('Lição')).toBeInTheDocument()
    expect(screen.getByText(/Digite a letra/)).toBeInTheDocument()
  })

  it('shows correct tip for profile context', async () => {
    render(<HelpButton context="profile" />)

    await userEvent.click(screen.getByRole('button', { name: 'Ajuda' }))
    expect(screen.getByText('Perfil')).toBeInTheDocument()
  })

  it('closes tooltip on escape key', async () => {
    render(<HelpButton context="dashboard" />)

    await userEvent.click(screen.getByRole('button', { name: 'Ajuda' }))
    expect(screen.getByText('Dashboard')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })
})
