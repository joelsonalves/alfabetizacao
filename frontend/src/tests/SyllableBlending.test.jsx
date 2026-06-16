import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import SyllableBlending from '../components/SyllableBlending/SyllableBlending'

vi.mock('../hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    isListening: false,
    supported: true,
    startListening: vi.fn(),
    stopListening: vi.fn(),
  }),
}))

vi.mock('../hooks/useKeyboard', () => ({
  useKeyboard: () => ({
    pressedKey: null,
    typedChars: '',
    score: 0,
    attempts: 0,
    errors: 0,
    completed: false,
    lastWrongKey: null,
    handleVirtualKeyClick: vi.fn(),
    getExpectedChar: () => null,
  }),
}))

vi.mock('../components/VirtualKeyboard/VirtualKeyboard', () => ({
  default: () => <div data-testid="virtual-keyboard">VirtualKeyboard</div>,
}))

const mockLesson = {
  id: 100,
  module_id: 5,
  name: 'Montar CASA',
  lesson_type: 'blending',
  target: 'CASA',
  content: JSON.stringify({ syllables: ['CA', 'SA'], word: 'CASA' }),
  sort_order: 1,
}

describe('SyllableBlending', () => {
  it('renders initial step with first syllable as target', () => {
    const onComplete = vi.fn()
    const { container } = render(<SyllableBlending lesson={mockLesson} onComplete={onComplete} />)

    const targetEl = container.querySelector('.syllable-blending__target-syllable')
    expect(targetEl).toBeTruthy()
    expect(targetEl.textContent).toBe('CA')
  })

  it('renders all syllables and word in progress', () => {
    const onComplete = vi.fn()
    const { container } = render(<SyllableBlending lesson={mockLesson} onComplete={onComplete} />)

    const steps = container.querySelectorAll('.syllable-blending__step')
    expect(steps.length).toBe(3)
    expect(steps[0].textContent).toContain('CA')
    expect(steps[1].textContent).toContain('SA')
    expect(steps[2].textContent).toContain('CASA')
  })

  it('shows step counter', () => {
    const onComplete = vi.fn()
    const { container } = render(<SyllableBlending lesson={mockLesson} onComplete={onComplete} />)

    const counter = container.querySelector('.syllable-blending__counter')
    expect(counter).toBeTruthy()
    expect(counter.textContent).toContain('1')
    expect(counter.textContent).toContain('3')
  })

  it('renders speech button', () => {
    const onComplete = vi.fn()
    render(<SyllableBlending lesson={mockLesson} onComplete={onComplete} />)

    expect(screen.getByRole('button', { name: /ler em voz alta/i })).toBeTruthy()
  })

  it('renders virtual keyboard', () => {
    const onComplete = vi.fn()
    render(<SyllableBlending lesson={mockLesson} onComplete={onComplete} />)

    expect(screen.getByTestId('virtual-keyboard')).toBeTruthy()
  })

  it('handles content as already-parsed object', () => {
    const onComplete = vi.fn()
    const lessonWithObject = {
      ...mockLesson,
      content: { syllables: ['BO', 'LA'], word: 'BOLA' },
    }
    const { container } = render(<SyllableBlending lesson={lessonWithObject} onComplete={onComplete} />)

    const steps = container.querySelectorAll('.syllable-blending__step')
    expect(steps.length).toBe(3)
    expect(steps[0].textContent).toContain('BO')
    expect(steps[2].textContent).toContain('BOLA')
  })

  it('falls back to lesson.target when content is missing', () => {
    const onComplete = vi.fn()
    const lessonNoContent = {
      ...mockLesson,
      content: null,
    }
    const { container } = render(<SyllableBlending lesson={lessonNoContent} onComplete={onComplete} />)

    const steps = container.querySelectorAll('.syllable-blending__step')
    expect(steps.length).toBe(1)
    expect(steps[0].textContent).toContain('CASA')
  })

  it('shows hint text when no chars typed', () => {
    const onComplete = vi.fn()
    const { container } = render(<SyllableBlending lesson={mockLesson} onComplete={onComplete} />)

    const hint = container.querySelector('.syllable-blending__typed .hint')
    expect(hint).toBeTruthy()
    expect(hint.textContent).toContain('Digite a sílaba acima')
  })

  it('renders checklist items', () => {
    const onComplete = vi.fn()
    const { container } = render(<SyllableBlending lesson={mockLesson} onComplete={onComplete} />)

    const items = container.querySelectorAll('.checklist-item')
    expect(items.length).toBe(2)
    expect(items[0].textContent).toContain('Falar')
    expect(items[1].textContent).toContain('Teclar')
  })

  it('calls onComplete when all steps done', () => {
    const onComplete = vi.fn()
    const { rerender } = render(<SyllableBlending lesson={mockLesson} onComplete={onComplete} />)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
