import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
      word: () => Promise.resolve({ type: 'emoji', value: '🖼️' }),
    },
  },
}))

vi.mock('../hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    speakLetter: vi.fn(),
    speakSyllable: vi.fn(),
    speakWord: vi.fn(),
    speakLetterWithWord: vi.fn(),
    supported: true,
  }),
  LETTER_SOUNDS: { A: 'a' },
  LETTER_WORDS: { A: 'Abelha' },
}))

vi.mock('../hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    isListening: false,
    supported: true,
    startListening: vi.fn(),
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
      expect(screen.getByRole('button', { name: 'Q' })).toBeInTheDocument()
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
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))
    await waitFor(() => {
      expect(mockApiProgressUpdate).toHaveBeenCalled()
    })
  })
})
