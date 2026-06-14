import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import StarRating from '../components/StarRating/StarRating'

describe('StarRating', () => {
  it('renders 3 empty stars by default', () => {
    render(<StarRating />)
    const stars = screen.getAllByText('☆')
    expect(stars).toHaveLength(3)
  })

  it('renders 1 filled star', () => {
    render(<StarRating stars={1} />)
    expect(screen.getAllByText('⭐')).toHaveLength(1)
    expect(screen.getAllByText('☆')).toHaveLength(2)
  })

  it('renders 3 filled stars', () => {
    render(<StarRating stars={3} />)
    expect(screen.getAllByText('⭐')).toHaveLength(3)
    expect(screen.queryAllByText('☆')).toHaveLength(0)
  })

  it('renders 0 stars', () => {
    render(<StarRating stars={0} />)
    expect(screen.getAllByText('☆')).toHaveLength(3)
  })

  it('renders with custom max', () => {
    render(<StarRating stars={2} max={5} />)
    expect(screen.getAllByText('⭐')).toHaveLength(2)
    expect(screen.getAllByText('☆')).toHaveLength(3)
  })
})
