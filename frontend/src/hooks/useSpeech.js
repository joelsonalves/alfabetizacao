import { useCallback, useRef, useEffect, useState } from 'react'

export const LETTER_SOUNDS = {
  'A': 'a', 'E': 'é', 'I': 'i', 'O': 'ó', 'U': 'u',
  'B': 'bê', 'C': 'cê', 'D': 'dê', 'F': 'éfi', 'G': 'gê',
  'H': 'agá', 'J': 'jóta', 'K': 'cá', 'L': 'éli', 'M': 'ême',
  'N': 'êni', 'P': 'pê', 'Q': 'quê', 'R': 'érre', 'S': 'ésse',
  'T': 'tê', 'V': 'vê', 'W': 'dábliu', 'X': 'xis', 'Y': 'ípsilon',
  'Z': 'zê',
}

export const LETTER_WORDS = {
  'A': 'abelha', 'B': 'basquete', 'C': 'cachorro', 'D': 'dado', 'E': 'estrela',
  'F': 'fogo', 'G': 'gato', 'H': 'hospital', 'I': 'iguana', 'J': 'jacaré',
  'K': 'kiwi', 'L': 'limão', 'M': 'maçã', 'N': 'nota', 'O': 'olho',
  'P': 'pinguim', 'Q': 'queijo', 'R': 'rato', 'S': 'sol', 'T': 'tartaruga',
  'U': 'unicórnio', 'V': 'vaca',   'W': 'waffle', 'X': 'xis', 'Y': 'ioiô', 'Z': 'zebra',
}

const TTS_LANG = import.meta.env.VITE_TTS_LANG || 'pt-BR'
const TTS_LANG_PREFIX = TTS_LANG.split('-')[0]

export function useSpeech() {
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
    utterance.rate = 0.9
    utterance.pitch = 1.0

    utterance.onend = () => {
      setIsSpeaking(false)
      if (onEnd) onEnd()
    }
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [ptVoice])

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

  const speakLetterWithWord = useCallback((letter) => {
    const upper = letter.toUpperCase()
    const word = LETTER_WORDS[upper]
    if (word) {
      const capitalized = word.charAt(0).toUpperCase() + word.slice(1)
      speak(`${upper}... de ${capitalized}.`)
    } else {
      const sound = LETTER_SOUNDS[upper] || upper
      speak(sound)
    }
  }, [speak])

  return { speak, speakLetter, speakSyllable, speakWord, speakLetterWithWord, supported, isSpeaking, voices, ptVoice }
}
