import { describe, it, expect } from 'vitest'
import { normalize, stripSpaces, getExpectedChar, normalizeKey } from '../string'

describe('normalize', () => {
  it('strips diacritics and uppercases', () => {
    expect(normalize('café')).toBe('CAFE')
  })

  it('removes non-alpha chars except spaces', () => {
    expect(normalize('Olá! Como vai?')).toBe('OLA COMO VAI')
  })

  it('trims whitespace', () => {
    expect(normalize('  casa  ')).toBe('CASA')
  })

  it('handles null/undefined', () => {
    expect(normalize(null)).toBe('')
    expect(normalize(undefined)).toBe('')
  })
})

describe('stripSpaces', () => {
  it('removes all spaces', () => {
    expect(stripSpaces('O GATO BEBE')).toBe('OGATOBEBE')
  })

  it('handles null/undefined', () => {
    expect(stripSpaces(null)).toBe('')
  })
})

describe('getExpectedChar', () => {
  it('returns first char when none typed', () => {
    expect(getExpectedChar('CASA', '')).toBe('C')
  })

  it('returns next char after typed chars', () => {
    expect(getExpectedChar('CASA', 'CA')).toBe('S')
  })

  it('returns null when fully typed', () => {
    expect(getExpectedChar('CASA', 'CASA')).toBeNull()
  })

  it('returns null for null target', () => {
    expect(getExpectedChar(null, '')).toBeNull()
  })
})

describe('normalizeKey', () => {
  it('strips diacritics and uppercases', () => {
    expect(normalizeKey('á')).toBe('A')
  })

  it('keeps non-alpha chars', () => {
    expect(normalizeKey('1')).toBe('1')
  })
})
