import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ProgressBar from '../components/ProgressBar/ProgressBar'

describe('ProgressBar', () => {
  it('renders with correct percentage', () => {
    render(<ProgressBar value={50} max={100} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders at 0% when value is 0', () => {
    render(<ProgressBar value={0} max={100} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders at 100% when value equals max', () => {
    render(<ProgressBar value={100} max={100} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('caps at 100% when value exceeds max', () => {
    render(<ProgressBar value={150} max={100} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<ProgressBar value={50} max={100} label="Progresso" />)
    expect(screen.getByText('Progresso')).toBeInTheDocument()
  })

  it('renders 0% when max is 0', () => {
    render(<ProgressBar value={50} max={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('uses default values when not provided', () => {
    render(<ProgressBar />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
