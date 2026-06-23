import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, updateProgressWithRetry } from '../services/api'
import { useSpeech } from '../hooks/useSpeech'
import { LETTER_SOUNDS, LETTER_WORDS } from '../constants/speech'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useKeyboard } from '../hooks/useKeyboard'
import { useAuth } from '../hooks/useAuth'
import VirtualKeyboard from '../components/VirtualKeyboard/VirtualKeyboard'
import LevelUp from '../components/LevelUp/LevelUp'
import SyllableBlending from '../components/SyllableBlending/SyllableBlending'
import { POINTS, SPEECH_PREFIXES, SPEECH_TYPE_LABELS, SPEECH_TYPE_NAMES, SPEECH_TIMEOUTS } from '../constants/lesson'
import { normalize, stripSpaces, getExpectedChar } from '../utils/string'
import { isSubsequence } from '../utils/array'
import { tryExtractTarget, extractSpokenContent } from '../utils/speech'
import { createFeedback } from '../utils/feedback'
import './Lesson.css'

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
  const [speechCorrect, setSpeechCorrect] = useState(null)
  const [speechExpected, setSpeechExpected] = useState('')
  const [speechScore, setSpeechScore] = useState(0)
  const [speechNoResult, setSpeechNoResult] = useState(false)
  const [levelUp, setLevelUp] = useState(null)
  const [retryError, setRetryError] = useState(null)
  const { user, setUser } = useAuth()

  const [hasListened, setHasListened] = useState(false)
  const [hasSpoken, setHasSpoken] = useState(false)
  const [moduleLessons, setModuleLessons] = useState([])
  const [moduleCompletedLessons, setModuleCompletedLessons] = useState(new Set())
  const [blendingCompleted, setBlendingCompleted] = useState(false)

  const { speak, speakLetter, speakSyllable, speakWord, speakLetterWithWord, supported: ttsSupported, isSpeaking } = useSpeech()
  const { isListening, supported: srSupported, startListening, stopListening } = useSpeechRecognition()

  const [feedbacks, setFeedbacks] = useState([])

  const addFeedback = useCallback((type, message) => {
    setFeedbacks(prev => [...prev.slice(-4), createFeedback(type, message)])
  }, [])

  const handleBlendingComplete = useCallback(() => {
    setBlendingCompleted(true)
  }, [])

  const lessonRef = useRef(lesson)
  lessonRef.current = lesson

  const onKeyPress = useCallback((key) => {
    if (!ttsSupported) return
    const currentLesson = lessonRef.current
    const isLetterOrSyllable = currentLesson?.lesson_type === 'letter' || currentLesson?.lesson_type === 'syllable'
    if (isLetterOrSyllable) {
      speakLetter(key)
    }
    addFeedback('keyboard', `Tecla: ${key}`)
  }, [ttsSupported, speakLetter, addFeedback])

  const kb = useKeyboard({
    onKeyPress,
    target: lesson?.target || '',
    lessonType: lesson?.lesson_type || '',
  })

  const prevTypedChars = useRef('')

  const canComplete = lesson?.lesson_type === 'blending'
    ? blendingCompleted
    : (kb.completed && (!srSupported || !ttsSupported || (hasListened && hasSpoken)))

  useEffect(() => {
    if (canComplete && !lessonCompleted) {
      setLessonCompleted(true)
      const currentLesson = lessonRef.current
      setModuleCompletedLessons(prev => new Set(prev).add(currentLesson.id))
      const points = (POINTS[currentLesson?.lesson_type] || 10) + speechScore
      const accuracy = kb.attempts > 0 ? Math.round(((kb.attempts - kb.errors) / kb.attempts) * 100) : 100
      const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1

      setTimeout(() => {
        const prevLevel = user?.level || 1
        updateProgressWithRetry(currentLesson.id, {
          score: points,
          stars,
          completed: true,
          attempts: 1,
        }).then((data) => {
          if (data && data.__conflict) {
            setRetryError('Não foi possível salvar o progresso. Tente novamente.')
            setShowResult(true)
            return
          }
          if (data.level > prevLevel) {
            setLevelUp({ level: data.level, xp: data.xp })
            if (setUser) setUser(u => u ? { ...u, level: data.level, xp: data.xp } : u)
          }
          setRetryError(null)
          setShowResult(true)
        }).catch((err) => {
          setRetryError('Erro ao salvar progresso. Tente novamente.')
          setShowResult(true)
        })
      }, 500)
    }
  }, [canComplete])

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
    setSpeechCorrect(null)
    setSpeechExpected('')
    setSpeechScore(0)
    setSpeechNoResult(false)
    setHasListened(false)
    setHasSpoken(false)
    setModuleLessons([])
    setModuleCompletedLessons(new Set())
    setFeedbacks([])
    setRetryError(null)
    setBlendingCompleted(false)
    prevTypedChars.current = ''

    Promise.all([
      api.modules.getLesson(lessonId),
      api.modules.list(),
      api.progress.get(),
    ]).then(([l, mods, progress]) => {
      setLesson(l)
      lessonRef.current = l
      if (l.active === false) {
        navigate('/dashboard')
        return
      }
      const mod = mods.find(m => m.id === l.module_id)
      setModule(mod)

      api.modules.lessons(l.module_id).then(setModuleLessons).catch(() => {})

      const completedSet = new Set()
      if (progress) {
        const arr = Array.isArray(progress) ? progress : [progress]
        arr.forEach(p => { if (p.completed) completedSet.add(p.lesson_id) })
      }
      setModuleCompletedLessons(completedSet)

      if (l.image_url && l.image_active !== false) {
        setImageData({ type: 'emoji', value: l.image_url, alt: l.alt_text || l.target })
      } else if (l.image_url && l.image_active === false) {
        setImageData({ type: 'hidden', placeholder: l.placeholder_text || 'Imagem oculta' })
      } else if (l.lesson_type === 'letter' || l.lesson_type === 'consonant') {
        api.images.emoji(l.target).then(setImageData).catch(() => {})
      } else if (l.lesson_type === 'syllable') {
        api.images.syllable(l.target).then(setImageData).catch(() => {})
      } else if (l.lesson_type === 'word') {
        api.images.word(l.target).then(setImageData).catch(() => {})
      } else if (l.lesson_type === 'phrase' || l.lesson_type === 'sentence') {
        api.images.text(l.target).then(setImageData).catch(() => {})
      }
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [lessonId])

  const handleSpeech = () => {
    if (isListening) {
      stopListening()
      return
    }
    setSpeechNoResult(false)
    const timeout = SPEECH_TIMEOUTS[lesson?.lesson_type] || 4000
    startListening(
      (transcript) => {
        setSpeechNoResult(false)
        const currentLesson = lessonRef.current
        if (!currentLesson) return

        const target = currentLesson.target?.toUpperCase() || ''
        const displayTarget = target.replace(/[^A-ZÀ-Ü\s]/g, '').trim()
        const acceptedSounds = [target]

        if (currentLesson.lesson_type === 'letter' || currentLesson.lesson_type === 'consonant') {
          const sound = LETTER_SOUNDS[target]?.toUpperCase()
          if (sound) acceptedSounds.push(sound)
        }

        const { content, isCorrect } = extractSpokenContent(transcript, target, acceptedSounds, currentLesson.lesson_type)
        setSpeechResult(content)
        setSpeechCorrect(isCorrect)
        setSpeechExpected(displayTarget)

        if (isCorrect) {
          setHasSpoken(true)
          setSpeechScore(s => s + 5)
          addFeedback('speech', `Falou: ${content} ✅`)
          if (ttsSupported) {
            const typeName = SPEECH_TYPE_NAMES[currentLesson?.lesson_type] || 'letra'
            speak(`Muito bem! Você acertou a ${typeName} ${displayTarget}.`)
          }
        } else {
          addFeedback('speech', `Falou: ${content} ❌ (esperado: ${displayTarget})`)
          if (ttsSupported) {
            const typeName = SPEECH_TYPE_NAMES[currentLesson?.lesson_type] || 'letra'
            speak(`Quase! Tente novamente. A ${typeName} é ${displayTarget}.`)
          }
        }
      },
      (error) => {
        if (error === 'no-speech' || error === 'audio-capture') {
          setSpeechNoResult(true)
          addFeedback('speech', 'Não entendi. Tente novamente.')
        }
      },
      () => {
        setSpeechNoResult(true)
        addFeedback('speech', 'Não entendi. Tente novamente.')
      },
      timeout,
    )
  }

  const nextLesson = async () => {
    try {
      if (lesson) {
        setModuleCompletedLessons(prev => new Set(prev).add(lesson.id))
      }
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

  const handleNavigateLesson = (targetId) => {
    if (targetId !== lesson?.id) {
      navigate(`/lesson/${moduleId}/${targetId}`)
    }
  }

  const currentLessonIdx = moduleLessons.findIndex(l => l.id === lesson?.id)
  const nextBtnRef = useRef(null)

  useEffect(() => {
    if (showResult && !levelUp && nextBtnRef.current) {
      nextBtnRef.current.focus()
    }
  }, [showResult, levelUp])

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
          <span>⭐ {kb.score + speechScore}pts</span>
          <span>❌ {kb.errors}</span>
          {speechScore > 0 && <span>🎤 +{speechScore}</span>}
        </div>
      </div>

      {retryError && (
        <div className="notification notification-error" onClick={() => setRetryError(null)}>
          ⚠️ {retryError}
        </div>
      )}

      {moduleLessons.length > 1 && (
        <div className="lesson-nav">
          {moduleLessons.map((ll) => {
            const isCurrent = ll.id === lesson?.id
            const isCompleted = moduleCompletedLessons.has(ll.id)
            return (
              <button
                key={ll.id}
                className={`lesson-nav-item ${isCurrent ? 'active' : ''}`}
                onClick={() => handleNavigateLesson(ll.id)}
              >
                {isCompleted ? '✅' : ''} {ll.target}
              </button>
            )
          })}
        </div>
      )}

      <div className="lesson-content card">
        {lesson.lesson_type === 'blending' ? (
          <SyllableBlending lesson={lesson} onComplete={handleBlendingComplete} />
        ) : (
          <>
            <div className="lesson-target-area">
              {imageData && imageData.type !== 'hidden' && (
                <div className="lesson-image">
                  {imageData.type === 'emoji' ? (
                    <span className="lesson-emoji">{imageData.value}</span>
                  ) : (
                    <img src={imageData.url} alt={imageData.alt || lesson.target} className="lesson-real-image" />
                  )}
                </div>
              )}
              {imageData && imageData.type === 'hidden' && (
                <div className="lesson-image-hidden">
                  <span className="placeholder-text">{imageData.placeholder}</span>
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
                {kb.typedChars}
              </div>
              {kb.lastWrongKey && (
                <div className="typing-error">
                  ❌ Você digitou: <strong>{kb.lastWrongKey}</strong> (esperado: <strong>{kb.getExpectedChar()}</strong>)
                </div>
              )}

              <div className="progress-checklist">
                <div className={`checklist-item ${hasListened ? 'done' : ''}`}>
                  <span className="checklist-icon">{hasListened ? '✅' : '❌'}</span>
                  <span className="checklist-label">Ouvir</span>
                  <span className="checklist-desc">"{lesson.lesson_type === 'review'
                    ? lesson.target.split('').join(' ')
                    : lesson.lesson_type === 'letter' || lesson.lesson_type === 'consonant'
                      ? `${lesson.target} → de ${(LETTER_WORDS[lesson.target?.toUpperCase()] || lesson.target).replace(/^./, m => m.toUpperCase())}`
                      : lesson.target}"</span>
                </div>
                <div className={`checklist-item ${speechCorrect ? 'done' : ''}`}>
                  <span className="checklist-icon">{speechCorrect ? '✅' : '❌'}</span>
                  <span className="checklist-label">Falar</span>
                  <span className="checklist-desc">Fale: {lesson.target}</span>
                </div>
                <div className={`checklist-item ${kb.typedChars?.length >= (lesson?.target?.length || 0) ? 'done' : ''}`}>
                  <span className="checklist-icon">{kb.typedChars?.length >= (lesson?.target?.length || 0) ? '✅' : '❌'}</span>
                  <span className="checklist-label">Teclar</span>
                  <span className="checklist-desc">Digite o que está na tela</span>
                </div>
              </div>

              {srSupported && (
                <div className="speech-actions">
                  {ttsSupported && (
                    <button
                      className="btn btn-ghost listen-btn"
                      onClick={() => {
                        setHasListened(true)
                        if (lesson.lesson_type === 'review') {
                          const sentence = lesson.target.split('').map(ch => {
                            const upper = ch.toUpperCase()
                            const word = LETTER_WORDS[upper]
                            if (word) {
                              const capitalized = word.charAt(0).toUpperCase() + word.slice(1)
                              return `${upper} de ${capitalized}`
                            }
                            return upper
                          }).join('. ') + '.'
                          speak(sentence)
                        } else if (lesson.lesson_type === 'letter' || lesson.lesson_type === 'consonant') {
                          speakLetterWithWord(lesson.target)
                        } else {
                          speakWord(lesson.target)
                        }
                      }}
                      disabled={isSpeaking}
                      aria-label={`Ouvir pronúncia de ${lesson?.target || ''}`}
                    >
                      <>🔊 Ouvir <span className="speech-badge">1</span></>
                    </button>
                  )}
                  <button
                    className={`btn ${isListening ? 'btn-accent' : 'btn-secondary'} speech-btn`}
                    onClick={handleSpeech}
                    disabled={isSpeaking}
                    aria-label={isListening ? 'Terminei de ler' : `Ler em voz alta ${lesson?.target || ''}`}
                  >
                    {isListening ? <>🛑 Terminei de ler <span className="speech-badge">2</span></> : <>🎤 Ler em voz alta <span className="speech-badge">2</span></>}
                  </button>
                </div>
              )}
              {speechNoResult && (
                <div className="speech-noresult">
                  🎤 Não entendi. Tente dizer: <strong>{(SPEECH_TYPE_LABELS[lesson?.lesson_type] || '') + ' ' + (lesson?.target || '')}</strong>
                </div>
              )}
              {speechResult && (
                <div className={`speech-result ${speechCorrect ? 'speech-correct' : 'speech-incorrect'}`}>
                  {speechCorrect ? '✅' : '❌'} Você disse: <strong>{speechResult}</strong>
                  {!speechCorrect && (
                    <span className="speech-expected"> (esperado: {speechExpected})</span>
                  )}
                  {!speechCorrect && (
                    <div className="speech-suggestion">💡 Tente falar só a {SPEECH_TYPE_NAMES[lesson?.lesson_type] || 'letra'}: <strong>{speechExpected}</strong></div>
                  )}
                </div>
              )}
            </div>

            <div className="feedback-list" aria-live="polite" aria-relevant="additions">
              {feedbacks.map(fb => (
                <div key={fb.id} className={`feedback-item feedback-${fb.type}`}>
                  {fb.message}
                </div>
              ))}
            </div>

            <VirtualKeyboard
              pressedKey={kb.pressedKey}
              onKeyClick={kb.handleVirtualKeyClick}
              disabled={showResult}
            />
          </>
        )}
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
          <button ref={nextBtnRef} className="btn btn-primary" onClick={nextLesson}>
            Próxima Lição →
          </button>
        </div>
      )}
      {levelUp && (
        <LevelUp
          level={levelUp.level}
          xp={levelUp.xp}
          onClose={() => setLevelUp(null)}
        />
      )}
    </div>
  )
}
