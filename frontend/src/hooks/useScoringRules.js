import { useState, useEffect } from 'react'

const HARDCODED_FALLBACK = {
  points_letter: 10,
  points_syllable: 25,
  points_word: 50,
  points_blending: 60,
  points_phrase: 100,
  points_sentence: 100,
  points_per_key: 10,
  timeout_letter: 4000,
  timeout_syllable: 6000,
  timeout_word: 8000,
  timeout_blending: 20000,
  timeout_phrase: 20000,
  timeout_sentence: 20000,
  tts_rate: 0.9,
  tts_pitch: 1.0,
  xp_per_level: 500,
}

const RULES_CACHE = { ...HARDCODED_FALLBACK }
let cacheLoaded = false
let loadPromise = null

function parseValue(value) {
  const num = Number(value)
  return Number.isNaN(num) ? value : num
}

async function loadRules() {
  if (cacheLoaded) return
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    try {
      const res = await fetch('/api/scoring-rules')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const rules = await res.json()
      for (const rule of rules) {
        RULES_CACHE[rule.rule_key] = parseValue(rule.value)
      }
      cacheLoaded = true
    } catch {
      console.warn('useScoringRules: usando fallback (API indisponível)')
    }
  })()
  return loadPromise
}

export function useScoringRules() {
  const [loaded, setLoaded] = useState(cacheLoaded)
  const [rules, setRules] = useState({ ...RULES_CACHE })

  useEffect(() => {
    if (cacheLoaded) return
    loadRules().then(() => {
      setRules({ ...RULES_CACHE })
      setLoaded(true)
    })
  }, [])

  return { rules, loaded }
}

export function getPointsForLessonType(lessonType, rules = RULES_CACHE) {
  const key = `points_${lessonType}`
  return rules[key] ?? HARDCODED_FALLBACK[key] ?? 10
}

export function getTimeoutForLessonType(lessonType, rules = RULES_CACHE) {
  const key = `timeout_${lessonType}`
  return rules[key] ?? HARDCODED_FALLBACK[key] ?? 4000
}

export function getTtsRate(rules = RULES_CACHE) {
  return rules.tts_rate ?? HARDCODED_FALLBACK.tts_rate
}

export function getTtsPitch(rules = RULES_CACHE) {
  return rules.tts_pitch ?? HARDCODED_FALLBACK.tts_pitch
}

export function getPointsPerKey(rules = RULES_CACHE) {
  return rules.points_per_key ?? HARDCODED_FALLBACK.points_per_key
}

export function getXpPerLevel(rules = RULES_CACHE) {
  return rules.xp_per_level ?? HARDCODED_FALLBACK.xp_per_level
}
