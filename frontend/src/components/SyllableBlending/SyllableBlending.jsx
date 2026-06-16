import React, { useState, useCallback, useEffect } from 'react'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useKeyboard } from '../../hooks/useKeyboard'
import VirtualKeyboard from '../VirtualKeyboard/VirtualKeyboard'
import './SyllableBlending.css'

export default function SyllableBlending({ lesson, onComplete }) {
  const content = typeof lesson.content === 'string'
    ? JSON.parse(lesson.content)
    : lesson.content || { syllables: [], word: lesson.target }

  const steps = [...content.syllables, content.word]
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [speechDone, setSpeechDone] = useState(false)
  const [allDone, setAllDone] = useState(false)

  const currentTarget = steps[currentStep]
  const totalSteps = steps.length
  const isLastStep = currentStep === totalSteps - 1

  const { isListening, startListening, stopListening } = useSpeechRecognition()

  const onKeyPress = useCallback(() => {}, [])
  const kb = useKeyboard({
    onKeyPress,
    target: currentTarget,
    lessonType: 'blending',
  })

  useEffect(() => {
    if (speechDone && kb.completed && !allDone) {
      const next = currentStep + 1
      if (next >= totalSteps) {
        setAllDone(true)
        onComplete()
      } else {
        setCompletedSteps(prev => new Set(prev).add(currentStep))
        setCurrentStep(next)
        setSpeechDone(false)
      }
    }
  }, [speechDone, kb.completed, currentStep, totalSteps, allDone, onComplete])

  const normalize = (s) =>
    (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

  const handleSpeech = () => {
    if (isListening) {
      stopListening()
      setSpeechDone(true)
      return
    }

    const timeout = currentTarget.length <= 3 ? 4000 : 10000
    startListening(
      (transcript) => {
        const norm = normalize(transcript)
        const target = normalize(currentTarget)
        if (norm === target) {
          setSpeechDone(true)
        }
      },
      () => {},
      () => {},
      timeout,
    )
  }

  return (
    <div className="syllable-blending">
      <div className="syllable-blending__progress">
        {steps.map((step, i) => {
          const isDone = completedSteps.has(i)
          const isCurrent = i === currentStep
          return (
            <span
              key={i}
              className={`syllable-blending__step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
            >
              {isDone ? '✅ ' : ''}{isCurrent ? '⏳ ' : ''}{step}
            </span>
          )
        })}
        <span className="syllable-blending__counter">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      <div className="syllable-blending__target">
        {!isLastStep ? (
          <span className="syllable-blending__target-syllable">{currentTarget}</span>
        ) : (
          <div className="target-word">
            {currentTarget.split('').map((ch, i) => (
              <span
                key={i}
                className={`target-letter ${i < kb.typedChars.length ? 'typed' : ''} ${i === kb.typedChars.length ? 'current' : ''}`}
              >
                {ch}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="syllable-blending__typed">
        {kb.typedChars || <span className="hint">Digite a {!isLastStep ? 'sílaba' : 'palavra'} acima</span>}
      </div>

      <div className="syllable-blending__checklist">
        <div className={`checklist-item ${speechDone ? 'done' : ''}`}>
          <span className="checklist-icon">{speechDone ? '✅' : '❌'}</span>
          <span className="checklist-label">Falar</span>
          <span className="checklist-desc">{currentTarget}</span>
        </div>
        <div className={`checklist-item ${kb.completed ? 'done' : ''}`}>
          <span className="checklist-icon">{kb.completed ? '✅' : '❌'}</span>
          <span className="checklist-label">Teclar</span>
          <span className="checklist-desc">{currentTarget}</span>
        </div>
      </div>

      <div className="syllable-blending__actions speech-actions">
        <button
          className={`btn ${isListening ? 'btn-accent' : 'btn-secondary'} speech-btn`}
          onClick={handleSpeech}
          aria-label={isListening ? 'Terminei de ler' : `Ler em voz alta ${currentTarget}`}
        >
          {isListening
            ? <>🛑 Terminei de ler <span className="speech-badge">1</span></>
            : <>🎤 Ler em voz alta <span className="speech-badge">1</span></>
          }
        </button>
      </div>

      {currentStep > 0 && (
        <div className="syllable-blending__steps-done">
          {steps.slice(0, currentStep).map((step, i) => (
            <span key={i} className="syllable-blending__step-done">✅ {step}</span>
          ))}
        </div>
      )}

      <VirtualKeyboard
        pressedKey={kb.pressedKey}
        onKeyClick={kb.handleVirtualKeyClick}
        disabled={allDone}
      />
    </div>
  )
}
