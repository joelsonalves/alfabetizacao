import { describe, it, expect } from 'vitest'
import { tryExtractTarget, extractSpokenContent } from '../speech'

describe('tryExtractTarget', () => {
  it('exact match', () => {
    expect(tryExtractTarget('CASA', 'CASA', [], 'word')).toBe(true)
  })

  it('match with prefix', () => {
    expect(tryExtractTarget('PALAVRA CASA', 'CASA', [], 'word')).toBe(true)
  })

  it('no match', () => {
    expect(tryExtractTarget('BOLA', 'CASA', [], 'word')).toBe(false)
  })

  it('match with sound variant', () => {
    expect(tryExtractTarget('bê', 'B', ['B', 'BÊ'], 'letter')).toBe(true)
  })

  it('subsequence match for phrase', () => {
    expect(tryExtractTarget('O GATO PRETO BEBE', 'O GATO BEBE', [], 'phrase')).toBe(true)
  })

  it('normalized match with diacritics', () => {
    expect(tryExtractTarget('Café', 'CAFÉ', [], 'word')).toBe(true)
  })
})

describe('extractSpokenContent', () => {
  it('returns target when correct', () => {
    const result = extractSpokenContent('CASA', 'CASA', [], 'word')
    expect(result.isCorrect).toBe(true)
    expect(result.content).toBe('CASA')
  })

  it('returns normalized transcript when incorrect', () => {
    const result = extractSpokenContent('BOLA', 'CASA', [], 'word')
    expect(result.isCorrect).toBe(false)
    expect(result.content).toBe('BOLA')
  })
})
