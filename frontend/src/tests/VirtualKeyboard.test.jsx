import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import VirtualKeyboard from '../components/VirtualKeyboard/VirtualKeyboard'

describe('VirtualKeyboard', () => {
  it('renders all keys', () => {
    const onKeyClick = vi.fn()
    render(<VirtualKeyboard pressedKey={null} onKeyClick={onKeyClick} disabled={false} />)
    expect(screen.getByText('Q')).toBeInTheDocument()
    expect(screen.getByText('W')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('Ç')).toBeInTheDocument()
  })

  it('highlights pressed key', () => {
    render(<VirtualKeyboard pressedKey="A" onKeyClick={() => {}} disabled={false} />)
    const keyA = screen.getByText('A').closest('button')
    expect(keyA.className).toContain('vk-key-pressed')
  })

  it('does not highlight non-pressed keys', () => {
    render(<VirtualKeyboard pressedKey="A" onKeyClick={() => {}} disabled={false} />)
    const keyQ = screen.getByText('Q').closest('button')
    expect(keyQ.className).not.toContain('vk-key-pressed')
  })

  it('calls onKeyClick when a key is clicked', async () => {
    const onKeyClick = vi.fn()
    render(<VirtualKeyboard pressedKey={null} onKeyClick={onKeyClick} disabled={false} />)
    await userEvent.click(screen.getByText('A'))
    expect(onKeyClick).toHaveBeenCalledWith('A')
  })

  it('disables all keys when disabled prop is true', () => {
    render(<VirtualKeyboard pressedKey={null} onKeyClick={() => {}} disabled={true} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('renders all letter keys with text', () => {
    render(<VirtualKeyboard pressedKey={null} onKeyClick={() => {}} disabled={false} />)
    expect(screen.getByText('Z')).toBeInTheDocument()
    expect(screen.getByText('Ç')).toBeInTheDocument()
  })
})
