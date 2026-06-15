import { useState, useCallback, useRef } from 'react'

const SPEECH_TIMEOUT = 4000
const SR_LANG = import.meta.env.VITE_TTS_LANG || 'pt-BR'

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)

  const startListening = useCallback((onResult, onError, onNoResult) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = SR_LANG
    recognition.continuous = false
    recognition.interimResults = false

    let hasResult = false

    recognition.onresult = (event) => {
      hasResult = true
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      const transcript = event.results[0][0].transcript.trim().toUpperCase()
      if (onResult) onResult(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      hasResult = true
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (onError) onError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (!hasResult && onNoResult) onNoResult()
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)

    timeoutRef.current = setTimeout(() => {
      if (!hasResult) {
        try { recognition.stop() } catch (e) {}
        setIsListening(false)
        if (onNoResult) onNoResult()
      }
    }, SPEECH_TIMEOUT)
  }, [])

  const stopListening = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  return { isListening, supported, startListening, stopListening }
}
