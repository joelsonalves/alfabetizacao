import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock Web Speech API
window.speechSynthesis = {
  speak: () => {},
  cancel: () => {},
  getVoices: () => [],
  addEventListener: () => {},
}

window.SpeechRecognition = class MockSpeechRecognition {
  constructor() {
    this.lang = ''
    this.continuous = false
    this.interimResults = false
  }
  start() {}
  stop() {}
  addEventListener() {}
  removeEventListener() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
})
