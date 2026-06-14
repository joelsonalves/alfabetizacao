import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboard } from '../hooks/useKeyboard'

describe('useKeyboard', () => {
  const defaultProps = {
    target: 'A',
    lessonType: 'letter',
    onKeyPress: vi.fn(),
    onKeyCorrect: vi.fn(),
    onKeyWrong: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns initial state', () => {
    const { result } = renderHook(() => useKeyboard(defaultProps))
    expect(result.current.pressedKey).toBeNull()
    expect(result.current.typedChars).toBe('')
    expect(result.current.score).toBe(0)
    expect(result.current.completed).toBe(false)
    expect(result.current.errors).toBe(0)
  })

  it('handles correct key press', () => {
    const { result } = renderHook(() => useKeyboard(defaultProps))
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))
    })
    expect(result.current.typedChars).toBe('A')
    expect(result.current.score).toBe(10)
    expect(result.current.completed).toBe(true)
    expect(defaultProps.onKeyCorrect).toHaveBeenCalledWith('A')
  })

  it('handles incorrect key press', () => {
    const { result } = renderHook(() => useKeyboard(defaultProps))
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'B' }))
    })
    expect(result.current.typedChars).toBe('')
    expect(result.current.errors).toBe(1)
    expect(result.current.lastWrongKey).toBe('B')
    expect(defaultProps.onKeyWrong).toHaveBeenCalledWith('B')
  })

  it('ignores modifier keys', () => {
    const { result } = renderHook(() => useKeyboard(defaultProps))
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(result.current.typedChars).toBe('')
    expect(result.current.errors).toBe(0)
  })

  it('handles virtual key click', () => {
    const { result } = renderHook(() => useKeyboard(defaultProps))
    act(() => {
      result.current.handleVirtualKeyClick('A')
    })
    expect(result.current.typedChars).toBe('A')
    expect(result.current.completed).toBe(true)
  })

  it('completes multi-character target', () => {
    const props = { ...defaultProps, target: 'CASA', lessonType: 'word' }
    const { result } = renderHook(() => useKeyboard(props))
    'CASA'.split('').forEach((char) => {
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: char }))
      })
    })
    expect(result.current.typedChars).toBe('CASA')
    expect(result.current.completed).toBe(true)
    expect(result.current.score).toBe(40)
  })

  it('does not process keys when completed', () => {
    const { result } = renderHook(() => useKeyboard(defaultProps))
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' })) })
    expect(result.current.completed).toBe(true)
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'B' })) })
    expect(result.current.typedChars).toBe('A')
  })

  it('resets state on target change', () => {
    const { result, rerender } = renderHook((props) => useKeyboard(props), {
      initialProps: defaultProps,
    })
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' })) })
    expect(result.current.completed).toBe(true)
    rerender({ ...defaultProps, target: 'B' })
    expect(result.current.typedChars).toBe('')
    expect(result.current.completed).toBe(false)
    expect(result.current.score).toBe(0)
  })
})
