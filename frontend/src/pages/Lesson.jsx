import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, updateProgressWithRetry } from '../services/api'
import { useSpeech, LETTER_SOUNDS, LETTER_WORDS } from '../hooks/useSpeech'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useKeyboard } from '../hooks/useKeyboard'
import { useAuth } from '../hooks/useAuth'
import VirtualKeyboard from '../components/VirtualKeyboard/VirtualKeyboard'
import LevelUp from '../components/LevelUp/LevelUp'
import './Lesson.css'

const POINTS = { letter: 10, syllable: 25, word: 50, phrase: 100, sentence: 100 }

const SPEECH_PREFIXES = [
  'LETRA ', 'A LETRA ', 'O SOM DE ', 'SOM DE ', 'SOM DA ', 'O SOM DA ',
  'FALE ', 'DIGA ', 'A ', 'O ',
]

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

  const { speak, speakLetter, speakSyllable, speakWord, speakLetterWithWord, supported: ttsSupported } = useSpeech()
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

  const canComplete = kb.completed && (!srSupported || !ttsSupported || (hasListened && hasSpoken))

  useEffect(() => {
    if (canComplete && !lessonCompleted) {
      setLessonCompleted(true)
      const currentLesson = lessonRef.current
      const points = (POINTS[currentLesson?.lesson_type] || 10) + speechScore
      const accuracy = kb.attempts > 0 ? Math.round(((kb.attempts - kb.errors) / kb.attempts) * 100) : 100
      const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1

      if (ttsSupported && currentLesson?.lesson_type === 'word') {
        speakWord(currentLesson.target)
      }

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
    setRetryError(null)
    prevTypedChars.current = ''

    Promise.all([
      api.modules.getLesson(lessonId),
      api.modules.list(),
      api.progress.get(),
    ]).then(([l, mods, progress]) => {
      setLesson(l)
      lessonRef.current = l
      const mod = mods.find(m => m.id === l.module_id)
      setModule(mod)

      api.modules.lessons(l.module_id).then(setModuleLessons).catch(() => {})

      const completedSet = new Set()
      if (progress) {
        const arr = Array.isArray(progress) ? progress : [progress]
        arr.forEach(p => { if (p.completed) completedSet.add(p.lesson_id) })
      }
      setModuleCompletedLessons(completedSet)

      if (l.lesson_type === 'letter' || l.lesson_type === 'consonant') {
        api.images.emoji(l.target).then(setImageData).catch(() => {})
      } else if (l.lesson_type === 'word') {
        api.images.word(l.target).then(setImageData).catch(() => {})
      }
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [lessonId])

  const normalize = (s) => s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

  const stripSpaces = (s) => s.replace(/\s+/g, '')

  const tryExtractTarget = (transcript, target, sounds) => {
    const normalized = normalize(transcript)
    const t = normalize(target)

    if (sounds.some(s => normalized === normalize(s))) return true

    if (normalized === t) return true

    if (stripSpaces(normalized) === stripSpaces(t)) return true
    if (sounds.some(s => stripSpaces(normalized) === stripSpaces(normalize(s)))) return true

    for (const prefix of SPEECH_PREFIXES) {
      const stripped = normalized.replace(normalize(prefix), '')
      if (stripped === t) return true
      if (sounds.some(s => stripped === normalize(s))) return true
    }

    const words = normalized.split(/\s+/)
    if (words.includes(t)) return true
    if (sounds.some(s => words.includes(normalize(s)))) return true

    if (normalized.endsWith(t)) return true

    return false
  }

  const handleSpeech = () => {
    setSpeechNoResult(false)
    startListening(
      (transcript) => {
        setSpeechResult(transcript)
        setSpeechNoResult(false)
        const currentLesson = lessonRef.current
        if (!currentLesson) return

        const target = currentLesson.target?.toUpperCase() || ''
        const acceptedSounds = [target]

        if (currentLesson.lesson_type === 'letter' || currentLesson.lesson_type === 'consonant') {
          const sound = LETTER_SOUNDS[target]?.toUpperCase()
          if (sound) acceptedSounds.push(sound)
        }

        const isCorrect = tryExtractTarget(transcript, target, acceptedSounds)
        setSpeechCorrect(isCorrect)
        setSpeechExpected(target)

        if (isCorrect) {
          setHasSpoken(true)
          setSpeechScore(s => s + 5)
          if (ttsSupported) {
            speak(`Você falou ${transcript}. Parabéns!`)
          }
        } else {
          if (ttsSupported) {
            speak(`Você falou ${transcript}. Vamos tentar novamente!`)
          }
        }
      },
      (error) => {
        if (error === 'no-speech' || error === 'audio-capture') {
          setSpeechNoResult(true)
        }
      },
      () => {
        setSpeechNoResult(true)
      },
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
            const isCompleted = moduleCompletedLessons.has(ll.id) || ll.sort_order < (lesson?.sort_order || 0)
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
                      lesson.target.split('').forEach((ch, i) => {
                        setTimeout(() => speakLetterWithWord(ch), i * 1500)
                      })
                    } else if (lesson.lesson_type === 'letter' || lesson.lesson_type === 'consonant') {
                      speakLetterWithWord(lesson.target)
                    } else {
                      speakWord(lesson.target)
                    }
                  }}
                >
                  🔊 Ouvir
                </button>
              )}
              <button
                className={`btn ${isListening ? 'btn-accent' : 'btn-secondary'} speech-btn`}
                onClick={handleSpeech}
                disabled={isListening}
              >
                🎤 {isListening ? `Ouvindo: ${lesson?.target || ''}...` : `Fale: ${lesson?.target || ''}`}
              </button>
            </div>
          )}
          {speechNoResult && (
            <div className="speech-noresult">
              🎤 Não entendi. Tente dizer: <strong>LETRA {lesson?.target || ''}</strong>
            </div>
          )}
          {speechResult && (
            <div className={`speech-result ${speechCorrect ? 'speech-correct' : 'speech-incorrect'}`}>
              {speechCorrect ? '✅' : '❌'} Você disse: <strong>{speechResult}</strong>
              {!speechCorrect && (
                <span className="speech-expected"> (esperado: {speechExpected})</span>
              )}
              {!speechCorrect && (
                <div className="speech-suggestion">💡 Tente falar só a letra: <strong>{speechExpected}</strong></div>
              )}
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
