import { useState, useEffect, useCallback } from 'react'

const ABNT2_KEYS = [
  ['ESC', '!1', '@2', '#3', '$4', '%5', '¨6', '&7', '*8', '(9', ')0', '-_', '=+', 'BACKSPACE'],
  ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '´`', '[[', ']]', 'ENTER'],
  ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', '~^', 'ENTER'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<,', '>.', ':;', '?_', 'SHIFT'],
  ['CTRL', 'ALT', ' ', 'ALTGR', 'CTRL'],
]

export function useKeyboard({ onKeyPress, onKeyCorrect, onKeyWrong, target, lessonType }) {
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
    if (!target) return null
    const idx = typedChars.length
    if (idx < target.length) return target[idx].toUpperCase()
    return null
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
      if (key === expected) {
        setTypedChars(prev => prev + key)
        setScore(s => s + 10)
        if (onKeyCorrect) onKeyCorrect(key)

        const newTyped = typedChars + key
        if (newTyped === target.toUpperCase()) {
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
    const event = { key, preventDefault: () => {} }
    handleKeyDown(event)
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
