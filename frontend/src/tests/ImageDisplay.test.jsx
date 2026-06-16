import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ImageDisplay from '../components/ImageDisplay/ImageDisplay'

describe('ImageDisplay', () => {
  it('renders emoji when type is emoji', () => {
    const { container } = render(<ImageDisplay type="emoji" value="🐝" />)
    const el = container.querySelector('.image-display-emoji')
    expect(el).toBeInTheDocument()
    expect(el).toHaveTextContent('🐝')
  })

  it('renders img when url is provided', () => {
    render(<ImageDisplay url="https://example.com/img.jpg" alt="A house" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg')
    expect(img).toHaveAttribute('alt', 'A house')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('returns null when no type or url is given', () => {
    const { container } = render(<ImageDisplay />)
    expect(container.innerHTML).toBe('')
  })
})
