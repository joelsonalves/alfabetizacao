import { useCallback, useRef, useEffect, useState } from 'react'
import { LETTER_SOUNDS, LETTER_WORDS } from '../constants/speech'

const TTS_LANG = import.meta.env.VITE_TTS_LANG || 'pt-BR'
const TTS_LANG_PREFIX = TTS_LANG.split('-')[0]

export function useSpeech({ rate = 0.9, pitch = 1.0 } = {}) {
  const [voices, setVoices] = useState([])
  const [ptVoice, setPtVoice] = useState(null)
  const [supported, setSupported] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef(null)
  const onEndRef = useRef(null)

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false)
      return
    }

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices()
      setVoices(allVoices)
      const pt = allVoices.find(
        v => v.lang.startsWith(TTS_LANG) || v.lang.startsWith(TTS_LANG_PREFIX)
      )
      setPtVoice(pt || allVoices[0] || null)
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const speak = useCallback((text, onEnd) => {
    if (!window.speechSynthesis || !ptVoice) return

    window.speechSynthesis.cancel()
    setIsSpeaking(true)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = ptVoice
    utterance.lang = ptVoice.lang || TTS_LANG
    utterance.rate = rate
    utterance.pitch = pitch

    utterance.onend = () => {
      setIsSpeaking(false)
      if (onEnd) onEnd()
    }
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [ptVoice, rate, pitch])

  const speakLetter = useCallback((letter) => {
    const sound = LETTER_SOUNDS[letter.toUpperCase()] || letter
    speak(sound)
  }, [speak])

  const speakSyllable = useCallback((syllable) => {
    speak(syllable.toLowerCase())
  }, [speak])

  const speakWord = useCallback((word) => {
    speak(word.toLowerCase())
  }, [speak])

  const speakLetterWithWord = useCallback((letter, word) => {
    const upper = letter.toUpperCase()
    const association = word || LETTER_WORDS[upper]
    if (association) {
      const capitalized = association.charAt(0).toUpperCase() + association.slice(1)
      speak(`${upper}... de ${capitalized}.`)
    } else {
      const sound = LETTER_SOUNDS[upper] || upper
      speak(sound)
    }
  }, [speak])

  return { speak, speakLetter, speakSyllable, speakWord, speakLetterWithWord, supported, isSpeaking, voices, ptVoice }
}
