import { normalize, stripSpaces } from './string'
import { isSubsequence } from './array'
import { SPEECH_PREFIXES } from '../constants/lesson'

export function tryExtractTarget(transcript, target, sounds, lessonType) {
  const normalized = normalize(transcript)
  const t = normalize(target)

  if (sounds.some(s => normalized === normalize(s))) return true
  if (normalized === t) return true
  if (stripSpaces(normalized) === stripSpaces(t)) return true
  if (sounds.some(s => stripSpaces(normalized) === stripSpaces(normalize(s)))) return true

  for (const prefix of SPEECH_PREFIXES) {
    const stripped = normalized.replace(normalize(prefix), '').trim()
    if (stripped === t) return true
    if (sounds.some(s => stripped === normalize(s))) return true
  }

  const words = normalized.split(/\s+/)
  if (words.includes(t)) return true
  if (sounds.some(s => words.includes(normalize(s)))) return true
  if (normalized.endsWith(t)) return true

  if (lessonType === 'sentence' || lessonType === 'phrase') {
    const targetWords = t.split(/\s+/)
    const transcriptWords = normalized.split(/\s+/)
    if (isSubsequence(targetWords, transcriptWords)) return true
  }

  return false
}

export function extractSpokenContent(transcript, target, sounds, lessonType) {
  const isCorrect = tryExtractTarget(transcript, target, sounds, lessonType)
  const normalized = normalize(transcript)
  const content = isCorrect
    ? target
    : normalized || transcript
  return { content, isCorrect }
}
