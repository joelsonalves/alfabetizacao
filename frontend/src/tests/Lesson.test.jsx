import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import React from 'react'
import Lesson from '../pages/Lesson'

const mockLesson = {
  id: 1, module_id: 1, name: 'Vogal A', lesson_type: 'letter',
  target: 'A', content: null, sort_order: 1,
}

const mockModule = { id: 1, name: 'Vogais', module_type: 'vowel', description: '', sort_order: 1 }

const mockApiProgressUpdate = vi.fn().mockResolvedValue({ level: 1, xp: 50 })

vi.mock('../services/api', () => ({
  api: {
    modules: {
      getLesson: () => Promise.resolve(mockLesson),
      list: () => Promise.resolve([mockModule]),
      lessons: () => Promise.resolve([mockLesson]),
    },
    progress: {
      get: () => Promise.resolve([]),
      update: (...args) => mockApiProgressUpdate(...args),
    },
    images: {
      emoji: () => Promise.resolve({ type: 'emoji', value: '🍎' }),
      syllable: () => Promise.resolve({ type: 'emoji', value: '🍎' }),
      word: () => Promise.resolve({ type: 'emoji', value: '🖼️' }),
      text: () => Promise.resolve({ type: 'emoji', value: '🍎' }),
    },
  },
  updateProgressWithRetry: (...args) => mockApiProgressUpdate(...args),
}))

vi.mock('../hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    speakLetter: vi.fn(),
    speakSyllable: vi.fn(),
    speakWord: vi.fn(),
    speakLetterWithWord: vi.fn(),
    supported: true,
    isSpeaking: false,
  }),
  LETTER_SOUNDS: { A: 'a' },
  LETTER_WORDS: { A: 'Abelha' },
}))

let mockIsListening = false
const mockStartListening = vi.fn((onResult) => { onResult('A') })
const mockStopListening = vi.fn()

vi.mock('../hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    isListening: mockIsListening,
    supported: true,
    startListening: mockStartListening,
    stopListening: mockStopListening,
  }),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Teste', level: 1, xp: 0 },
    setUser: vi.fn(),
  }),
}))

describe('Lesson page', () => {
  beforeEach(() => {
    localStorage.clear()
    mockApiProgressUpdate.mockClear()
    mockIsListening = false
    mockStartListening.mockClear()
    mockStopListening.mockClear()
  })

  it('renders lesson info', async () => {
    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Vogais')).toBeInTheDocument()
    })
    expect(screen.getByText('Vogal A')).toBeInTheDocument()
    const targets = screen.getAllByText('A')
    expect(targets.length).toBeGreaterThanOrEqual(1)
  })

  it('shows virtual keyboard', async () => {
    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Letra Q' })).toBeInTheDocument()
    })
  })

  it('shows speech buttons', async () => {
    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Ouvir/ })).toBeInTheDocument()
    })
  })

  it('calls progress API when typing completes', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Vogais')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Ouvir/ }))
    await user.click(screen.getByRole('button', { name: /Ler em voz alta/ }))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))
    await waitFor(() => {
      expect(mockApiProgressUpdate).toHaveBeenCalled()
    })
  })

  it('displays lesson result on completion', async () => {
    const user = userEvent.setup()
    mockApiProgressUpdate.mockResolvedValue({ level: 1, xp: 50 })

    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Vogais')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Ouvir/ }))
    await user.click(screen.getByRole('button', { name: /Ler em voz alta/ }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))

    await waitFor(() => {
      expect(screen.getByText('🎉 Lição Completa!')).toBeInTheDocument()
    })
  })

  it('shows level up modal when level increases', async () => {
    const user = userEvent.setup()
    mockApiProgressUpdate.mockResolvedValue({ level: 2, xp: 50 })

    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Vogais')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Ouvir/ }))
    await user.click(screen.getByRole('button', { name: /Ler em voz alta/ }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))

    await waitFor(() => {
      expect(screen.getByText('🎉 Lição Completa!')).toBeInTheDocument()
    })
    expect(screen.getByText(/Nível 2/)).toBeInTheDocument()
  })

  it('focuses next lesson button on completion', async () => {
    const user = userEvent.setup()
    mockApiProgressUpdate.mockResolvedValue({ level: 1, xp: 50 })

    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Vogais')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Ouvir/ }))
    await user.click(screen.getByRole('button', { name: /Ler em voz alta/ }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))

    await waitFor(() => {
      expect(screen.getByText('Próxima Lição →')).toBeInTheDocument()
    })
    const nextBtn = screen.getByText('Próxima Lição →').closest('button')
    expect(document.activeElement).toBe(nextBtn)
  })

  it('renders "Ler em voz alta..." button on load', async () => {
    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Ler em voz alta/ })).toBeInTheDocument()
    })
    expect(screen.getByText('🎤 Ler em voz alta')).toBeInTheDocument()
  })

  it('shows "Terminei de ler" when listening and calls stopListening on click', async () => {
    mockIsListening = true
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('🛑 Terminei de ler')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Terminei de ler/ }))
    expect(mockStopListening).toHaveBeenCalled()
  })

  it('passes correct timeout for letter lessons', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Vogais')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Ler em voz alta/ }))
    expect(mockStartListening).toHaveBeenCalled()
    const lastCall = mockStartListening.mock.calls[0]
    const timeoutArg = lastCall[3]
    expect(timeoutArg).toBe(4000)
  })

  it('passes correct timeout for sentence lessons', async () => {
    const sentenceLesson = {
      id: 2, module_id: 1, name: 'Frase', lesson_type: 'sentence',
      target: 'O GATO CORRE', content: null, sort_order: 2,
    }

    const { api } = await import('../services/api')
    const origGetLesson = api.modules.getLesson
    const origLessons = api.modules.lessons
    api.modules.getLesson = () => Promise.resolve(sentenceLesson)
    api.modules.lessons = () => Promise.resolve([sentenceLesson])

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/lesson/1/2']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Frase')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Ler em voz alta/ }))
    expect(mockStartListening).toHaveBeenCalled()
    const lastCall = mockStartListening.mock.calls[0]
    const timeoutArg = lastCall[3]
    expect(timeoutArg).toBe(20000)

    api.modules.getLesson = origGetLesson
    api.modules.lessons = origLessons
  })

  it('shows retry error on conflict', async () => {
    const user = userEvent.setup()
    mockApiProgressUpdate.mockResolvedValue({ __conflict: true, detail: 'Conflict' })

    render(
      <MemoryRouter initialEntries={['/lesson/1/1']}>
        <Routes>
          <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Vogais')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Ouvir/ }))
    await user.click(screen.getByRole('button', { name: /Ler em voz alta/ }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))

    await waitFor(() => {
      expect(screen.getByText(/Não foi possível salvar/)).toBeInTheDocument()
    })
  })
})
