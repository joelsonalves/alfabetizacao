import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

class MockSpeechRecognition {
  constructor() {
    this.lang = ''
    this.continuous = false
    this.interimResults = false
    this.onresult = null
    this.onerror = null
    this.onend = null
  }
  start() { this._started = true }
  stop() { this._started = false }
  addEventListener() {}
  removeEventListener() {}
}

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    window.SpeechRecognition = MockSpeechRecognition
  })

  it('detects support', () => {
    const { result } = renderHook(() => useSpeechRecognition())
    expect(result.current.supported).toBe(true)
  })

  it('sets unsupported when API missing', () => {
    window.SpeechRecognition = undefined
    window.webkitSpeechRecognition = undefined
    const { result } = renderHook(() => useSpeechRecognition())
    act(() => { result.current.startListening() })
    expect(result.current.supported).toBe(false)
  })

  it('starts listening and sets isListening', () => {
    const { result } = renderHook(() => useSpeechRecognition())
    act(() => { result.current.startListening() })
    expect(result.current.isListening).toBe(true)
  })

  it('calls onResult with transcript', () => {
    const { result } = renderHook(() => useSpeechRecognition())
    const onResult = vi.fn()

    let recognitionInstance
    const origMock = window.SpeechRecognition
    window.SpeechRecognition = class extends MockSpeechRecognition {
      constructor() {
        super()
        recognitionInstance = this
      }
    }

    act(() => { result.current.startListening(onResult) })

    act(() => {
      recognitionInstance.onresult({
        results: [[{ transcript: 'A' }]],
      })
    })

    expect(onResult).toHaveBeenCalledWith('A')
    expect(result.current.isListening).toBe(false)
  })

  it('calls onError on recognition error', () => {
    const { result } = renderHook(() => useSpeechRecognition())
    const onError = vi.fn()

    let recognitionInstance
    window.SpeechRecognition = class extends MockSpeechRecognition {
      constructor() {
        super()
        recognitionInstance = this
      }
    }

    act(() => { result.current.startListening(undefined, onError) })

    act(() => {
      recognitionInstance.onerror({ error: 'no-speech' })
    })

    expect(onError).toHaveBeenCalledWith('no-speech')
  })

  it('calls onNoResult on timeout', () => {
    const { result } = renderHook(() => useSpeechRecognition())
    const onNoResult = vi.fn()

    let recognitionInstance
    window.SpeechRecognition = class extends MockSpeechRecognition {
      constructor() {
        super()
        recognitionInstance = this
      }
    }

    act(() => { result.current.startListening(undefined, undefined, onNoResult) })

    act(() => {
      recognitionInstance.onend()
    })

    expect(onNoResult).toHaveBeenCalled()
  })

  it('does not call onNoResult when stopListening is used', () => {
    const { result } = renderHook(() => useSpeechRecognition())
    const onNoResult = vi.fn()

    let recognitionInstance
    window.SpeechRecognition = class extends MockSpeechRecognition {
      constructor() {
        super()
        recognitionInstance = this
      }
    }

    act(() => { result.current.startListening(undefined, undefined, onNoResult) })
    act(() => { result.current.stopListening() })
    act(() => {
      recognitionInstance.onend()
    })

    expect(onNoResult).not.toHaveBeenCalled()
  })

  it('uses custom timeout when provided', () => {
    const { result } = renderHook(() => useSpeechRecognition())
    const onNoResult = vi.fn()

    act(() => { result.current.startListening(undefined, undefined, onNoResult, 20000) })

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(onNoResult).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(16000)
    })

    expect(onNoResult).toHaveBeenCalled()
  })

  it('stopListening stops recognition', () => {
    const { result } = renderHook(() => useSpeechRecognition())
    act(() => { result.current.startListening() })
    act(() => { result.current.stopListening() })
    expect(result.current.isListening).toBe(false)
  })
})
