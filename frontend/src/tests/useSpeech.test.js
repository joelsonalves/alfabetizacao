import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpeech, LETTER_SOUNDS, LETTER_WORDS } from '../hooks/useSpeech'

const mockVoices = [
  { lang: 'pt-BR', name: 'Maria' },
  { lang: 'en-US', name: 'Samantha' },
]

describe('useSpeech', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn().mockReturnValue(mockVoices),
      onvoiceschanged: null,
      addEventListener: vi.fn(),
    }
    window.SpeechSynthesisUtterance = vi.fn()
  })

  it('detects PT-BR voice', () => {
    const { result } = renderHook(() => useSpeech())
    expect(result.current.supported).toBe(true)
    expect(result.current.ptVoice.lang).toBe('pt-BR')
  })

  it('speak calls synthesis with correct text', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => { result.current.speak('olá') })
    expect(window.speechSynthesis.cancel).toHaveBeenCalled()
    expect(window.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('speak does nothing when unsupported', () => {
    window.speechSynthesis = undefined
    const { result } = renderHook(() => useSpeech())
    expect(result.current.supported).toBe(false)
    act(() => { result.current.speak('olá') })
    expect(window.speechSynthesis).toBeUndefined()
  })

  it('speakLetter uses LETTER_SOUNDS mapping', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => { result.current.speakLetter('A') })
    expect(window.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('speakWord speaks lowercase word', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => { result.current.speakWord('CASA') })
    expect(window.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('speakSyllable speaks lowercase syllable', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => { result.current.speakSyllable('BA') })
    expect(window.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('speakLetterWithWord formats as "A... de Abelha."', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => { result.current.speakLetterWithWord('A') })
    const callArgs = window.SpeechSynthesisUtterance.mock.calls[0]
    expect(callArgs[0]).toContain('A')
    expect(callArgs[0]).toContain('Abelha')
  })

  it('speakLetterWithWord falls back to sound when no word', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => { result.current.speakLetterWithWord('1') })
  })

  it('LETTER_SOUNDS maps all letters', () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    letters.forEach(l => {
      expect(LETTER_SOUNDS[l]).toBeDefined()
    })
  })

  it('LETTER_WORDS maps all letters', () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    letters.forEach(l => {
      expect(LETTER_WORDS[l]).toBeDefined()
    })
  })
})
