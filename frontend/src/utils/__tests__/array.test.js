import { describe, it, expect } from 'vitest'
import { isSubsequence } from '../array'

describe('isSubsequence', () => {
  it('target appears in order', () => {
    expect(isSubsequence(['O', 'GATO', 'BEBE'], ['O', 'GATO', 'PRETO', 'BEBE'])).toBe(true)
  })

  it('target out of order returns false', () => {
    expect(isSubsequence(['O', 'GATO', 'BEBE'], ['GATO', 'O', 'BEBE'])).toBe(false)
  })

  it('empty target returns true', () => {
    expect(isSubsequence([], ['qualquer'])).toBe(true)
  })

  it('exact match returns true', () => {
    expect(isSubsequence(['A', 'CASA'], ['A', 'CASA'])).toBe(true)
  })
})
