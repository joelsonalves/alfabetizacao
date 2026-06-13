import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useSpeech } from '../hooks/useSpeech'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useKeyboard } from '../hooks/useKeyboard'
import VirtualKeyboard from '../components/VirtualKeyboard/VirtualKeyboard'
import './Lesson.css'

const POINTS = { letter: 10, syllable: 25, word: 50, phrase: 100, sentence: 100 }

export default function Lesson() {
  const { moduleId, lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [module, setModule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lessonCompleted, setLessonCompleted] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [imageData, setImageData] = useState(null)
  const [speechResult, setSpeechResult] = useState('')

  const { speakLetter, speakSyllable, speakWord, supported: ttsSupported } = useSpeech()
  const { isListening, supported: srSupported, startListening } = useSpeechRecognition()

  const lessonRef = useRef(lesson)
  lessonRef.current = lesson

  const onKeyPress = useCallback((key) => {
    if (!ttsSupported) return
    const currentLesson = lessonRef.current
    const isLetterOrSyllable = currentLesson?.lesson_type === 'letter' || currentLesson?.lesson_type === 'syllable'
    if (isLetterOrSyllable) {
      speakLetter(key)
    }
  }, [ttsSupported, speakLetter])

  const kb = useKeyboard({
    onKeyPress,
    target: lesson?.target || '',
    lessonType: lesson?.lesson_type || '',
  })

  const prevTypedChars = useRef('')

  useEffect(() => {
    if (kb.completed && !lessonCompleted) {
      setLessonCompleted(true)
      const currentLesson = lessonRef.current
      const points = POINTS[currentLesson?.lesson_type] || 10
      const accuracy = kb.attempts > 0 ? Math.round(((kb.attempts - kb.errors) / kb.attempts) * 100) : 100
      const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1

      if (ttsSupported && currentLesson?.lesson_type === 'word') {
        speakWord(currentLesson.target)
      }

      setTimeout(() => {
        api.progress.update(currentLesson.id, {
          score: points,
          stars,
          completed: true,
          attempts: 1,
        }).then(() => {
          setShowResult(true)
        }).catch(console.error)
      }, 500)
    }
  }, [kb.completed])

  useEffect(() => {
    if (kb.typedChars && kb.typedChars !== prevTypedChars.current && !lessonCompleted) {
      prevTypedChars.current = kb.typedChars
      const currentLesson = lessonRef.current
      if (currentLesson?.lesson_type === 'syllable' && kb.typedChars.length >= 1 && ttsSupported) {
        speakSyllable(currentLesson.target)
      }
    }
  }, [kb.typedChars, lessonCompleted, ttsSupported, speakSyllable])

  useEffect(() => {
    setLessonCompleted(false)
    setShowResult(false)
    setImageData(null)
    setSpeechResult('')
    prevTypedChars.current = ''

    Promise.all([
      api.modules.getLesson(lessonId),
      api.modules.list(),
    ]).then(([l, mods]) => {
      setLesson(l)
      lessonRef.current = l
      const mod = mods.find(m => m.id === l.module_id)
      setModule(mod)

      if (l.lesson_type === 'letter' || l.lesson_type === 'consonant') {
        api.images.emoji(l.target).then(setImageData).catch(() => {})
      } else if (l.lesson_type === 'word') {
        api.images.word(l.target).then(setImageData).catch(() => {})
      }
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [lessonId])

  const handleSpeech = () => {
    startListening(
      (transcript) => {
        setSpeechResult(transcript)
        const target = lesson?.target?.toUpperCase() || ''
        if (transcript === target && ttsSupported) {
          speakWord(lesson.target)
        }
      },
      (error) => console.log('Speech error:', error),
    )
  }

  const nextLesson = async () => {
    try {
      const lessons = await api.modules.lessons(moduleId)
      const currentIdx = lessons.findIndex(l => l.id === lesson?.id)
      if (currentIdx < lessons.length - 1) {
        navigate(`/lesson/${moduleId}/${lessons[currentIdx + 1].id}`)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      navigate('/dashboard')
    }
  }

  if (loading) return <div className="loading">Carregando...</div>
  if (!lesson) return <div className="loading">Lição não encontrada</div>

  const displayChar = lesson?.target || ''
  const expected = kb.getExpectedChar()

  return (
    <div className="lesson fade-in">
      <div className="lesson-header">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          ← Voltar
        </button>
        <div className="lesson-info">
          <span className="lesson-module">{module?.name}</span>
          <span className="lesson-name">{lesson?.name}</span>
        </div>
        <div className="lesson-stats">
          <span>⭐ {kb.score}pts</span>
          <span>❌ {kb.errors}</span>
        </div>
      </div>

      <div className="lesson-content card">
        <div className="lesson-target-area">
          {imageData && (
            <div className="lesson-image">
              {imageData.type === 'emoji' ? (
                <span className="lesson-emoji">{imageData.value}</span>
              ) : (
                <img src={imageData.url} alt={imageData.alt || lesson.target} className="lesson-real-image" />
              )}
            </div>
          )}

          <div className="lesson-target-display">
            {lesson.lesson_type === 'letter' || lesson.lesson_type === 'syllable' ? (
              <span className={`target-char ${showResult ? 'target-done' : ''}`}>
                {displayChar}
              </span>
            ) : (
              <div className="target-word">
                {displayChar.split('').map((ch, i) => (
                  <span
                    key={i}
                    className={`target-letter ${i < kb.typedChars.length ? 'typed' : ''} ${i === kb.typedChars.length ? 'current' : ''}`}
                  >
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="lesson-typed">
            {kb.typedChars || <span className="hint">Digite o que está na tela</span>}
          </div>

          {srSupported && (
            <button
              className={`btn ${isListening ? 'btn-accent' : 'btn-secondary'} speech-btn`}
              onClick={handleSpeech}
              disabled={isListening}
            >
              🎤 {isListening ? 'Ouvindo...' : 'Falar'}
            </button>
          )}
          {speechResult && (
            <div className="speech-result">
              Você disse: <strong>{speechResult}</strong>
              {speechResult === lesson?.target?.toUpperCase() ? ' ✅' : ' ❌'}
            </div>
          )}
        </div>

        <VirtualKeyboard
          pressedKey={kb.pressedKey}
          onKeyClick={kb.handleVirtualKeyClick}
          disabled={showResult}
        />
      </div>

      {showResult && (
        <div className="lesson-result card slide-up">
          <h2>🎉 Lição Completa!</h2>
          <div className="result-details">
            <div className="result-stat">
              <span className="result-label">Pontos</span>
              <span className="result-value">{kb.score}</span>
            </div>
            <div className="result-stat">
              <span className="result-label">Precisão</span>
              <span className="result-value">
                {kb.attempts > 0 ? Math.round(((kb.attempts - kb.errors) / kb.attempts) * 100) : 100}%
              </span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={nextLesson}>
            Próxima Lição →
          </button>
        </div>
      )}
    </div>
  )
}
