import { useState, useEffect, useCallback } from 'react'
import { ABNT2_KEYS } from '../constants/keyboard'
import { normalizeKey, getExpectedChar as getExpectedCharFromString } from '../utils/string'
import { createSyntheticKeyboardEvent } from '../utils/keyboard'

export function useKeyboard({ onKeyPress, onKeyCorrect, onKeyWrong, target, lessonType, pointsPerKey = 10 }) {
  const [pressedKey, setPressedKey] = useState(null)
  const [typedChars, setTypedChars] = useState('')
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [errors, setErrors] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [lastWrongKey, setLastWrongKey] = useState(null)

  const isLetterType = lessonType === 'letter'
  const isSyllableType = lessonType === 'syllable'
  const isWordType = lessonType === 'word'

  useEffect(() => {
    setTypedChars('')
    setScore(0)
    setAttempts(0)
    setErrors(0)
    setCompleted(false)
    setLastWrongKey(null)
  }, [target, lessonType])

  const getExpectedChar = useCallback(() => {
    return getExpectedCharFromString(target, typedChars)
  }, [target, typedChars])

  const handleKeyDown = useCallback((event) => {
    if (completed) return

    const key = event.key.toUpperCase()
    if (key === 'ESCAPE' || key === 'TAB' || key === 'SHIFT' || key === 'CONTROL' || key === 'ALT' || key === 'META') return

    setPressedKey(key)

    if (onKeyPress) onKeyPress(key)

    const expected = getExpectedChar()
    if (expected) {
      setAttempts(a => a + 1)
      if (normalizeKey(key) === normalizeKey(expected)) {
        setTypedChars(prev => prev + expected)
        setScore(s => s + pointsPerKey)
        if (onKeyCorrect) onKeyCorrect(expected)

        const newTyped = typedChars + expected
        if (normalizeKey(newTyped) === normalizeKey(target.toUpperCase())) {
          setCompleted(true)
        }
      } else {
        setErrors(e => e + 1)
        setLastWrongKey(key)
        if (onKeyWrong) onKeyWrong(key)
      }
    }

    setTimeout(() => setPressedKey(null), 200)
  }, [completed, target, typedChars, getExpectedChar, onKeyPress, onKeyCorrect, onKeyWrong])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleVirtualKeyClick = useCallback((key) => {
    handleKeyDown(createSyntheticKeyboardEvent(key))
  }, [handleKeyDown])

  return {
    pressedKey,
    typedChars,
    score,
    attempts,
    errors,
    completed,
    lastWrongKey,
    ABNT2_KEYS,
    handleVirtualKeyClick,
    getExpectedChar,
    reset: () => {
      setTypedChars('')
      setScore(0)
      setAttempts(0)
      setErrors(0)
      setCompleted(false)
    },
  }
}
