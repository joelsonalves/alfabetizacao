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
  'U': 'unicórnio', 'V': 'vaca', 'W': 'lobo', 'X': 'xis', 'Y': 'ioiô', 'Z': 'zebra',
}

export function useSpeech() {
  const [voices, setVoices] = useState([])
  const [ptVoice, setPtVoice] = useState(null)
  const [supported, setSupported] = useState(true)
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
        v => v.lang.startsWith('pt') || v.lang.startsWith('pt-BR')
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

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = ptVoice
    utterance.lang = ptVoice.lang || 'pt-BR'
    utterance.rate = 0.9
    utterance.pitch = 1.0

    if (onEnd) {
      utterance.onend = onEnd
    }

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
    const sound = LETTER_SOUNDS[upper] || upper
    const word = LETTER_WORDS[upper]
    if (word) {
      speak(`${sound}. ${upper} de ${word}.`)
    } else {
      speak(sound)
    }
  }, [speak])

  return { speak, speakLetter, speakSyllable, speakWord, speakLetterWithWord, supported, voices, ptVoice }
}
