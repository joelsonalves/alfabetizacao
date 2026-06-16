import { describe, it, expect } from 'vitest'
import { parseLessonContent } from '../lesson'

describe('parseLessonContent', () => {
  it('parses string JSON content', () => {
    const lesson = { content: '{"syllables":["CA","SA"],"word":"CASA"}', target: 'CASA' }
    const result = parseLessonContent(lesson)
    expect(result.syllables).toEqual(['CA', 'SA'])
    expect(result.word).toBe('CASA')
  })

  it('returns object content as-is', () => {
    const lesson = { content: { syllables: ['BO', 'LA'], word: 'BOLA' }, target: 'BOLA' }
    const result = parseLessonContent(lesson)
    expect(result.syllables).toEqual(['BO', 'LA'])
  })

  it('returns fallback when content is missing', () => {
    const lesson = { target: 'GATO' }
    const result = parseLessonContent(lesson)
    expect(result.syllables).toEqual([])
    expect(result.word).toBe('GATO')
  })
})
