import { describe, it, expect } from 'vitest'
import { buildProgressMap, findProgressByLessonId } from '../progress'

describe('buildProgressMap', () => {
  it('converts array to map keyed by lesson_id', () => {
    const progress = [
      { lesson_id: 1, completed: true },
      { lesson_id: 2, completed: false },
    ]
    const result = buildProgressMap(progress)
    expect(result[1].completed).toBe(true)
    expect(result[2].completed).toBe(false)
  })

  it('returns empty object for non-array', () => {
    expect(buildProgressMap(null)).toEqual({})
    expect(buildProgressMap(undefined)).toEqual({})
  })

  it('returns empty object for empty array', () => {
    expect(buildProgressMap([])).toEqual({})
  })
})

describe('findProgressByLessonId', () => {
  it('finds matching lesson', () => {
    const list = [{ lesson_id: 1 }, { lesson_id: 2 }]
    expect(findProgressByLessonId(list, 2).lesson_id).toBe(2)
  })

  it('returns undefined for non-array', () => {
    expect(findProgressByLessonId(null, 1)).toBeUndefined()
  })
})
