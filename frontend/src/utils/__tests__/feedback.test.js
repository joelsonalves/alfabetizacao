import { describe, it, expect } from 'vitest'
import { createFeedback } from '../feedback'

describe('createFeedback', () => {
  it('creates feedback with type and message', () => {
    const fb = createFeedback('speech', 'Falou: CASA ✅')
    expect(fb.type).toBe('speech')
    expect(fb.message).toBe('Falou: CASA ✅')
    expect(fb.id).toBeTypeOf('number')
  })

  it('increments id on each call', () => {
    const fb1 = createFeedback('a', 'msg1')
    const fb2 = createFeedback('b', 'msg2')
    expect(fb2.id).toBe(fb1.id + 1)
  })
})
