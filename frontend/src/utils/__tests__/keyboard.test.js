import { describe, it, expect } from 'vitest'
import { createSyntheticKeyboardEvent } from '../keyboard'

describe('createSyntheticKeyboardEvent', () => {
  it('creates event with key and preventDefault', () => {
    const event = createSyntheticKeyboardEvent('A')
    expect(event.key).toBe('A')
    expect(event.preventDefault).toBeTypeOf('function')
    expect(() => event.preventDefault()).not.toThrow()
  })
})
