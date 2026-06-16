import { describe, it, expect, beforeEach } from 'vitest'
import { storeAuthData, clearAuthData, getStoredTokens, getStoredUser } from '../auth'

beforeEach(() => {
  localStorage.clear()
})

describe('storeAuthData', () => {
  it('saves token, refresh_token, and user to localStorage', () => {
    storeAuthData({
      access_token: 'abc123',
      refresh_token: 'ref456',
      user: { name: 'Joel', email: 'joel@test.com' },
    })
    expect(localStorage.getItem('token')).toBe('abc123')
    expect(localStorage.getItem('refresh_token')).toBe('ref456')
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ name: 'Joel', email: 'joel@test.com' })
  })
})

describe('clearAuthData', () => {
  it('removes all auth data from localStorage', () => {
    localStorage.setItem('token', 'abc')
    localStorage.setItem('refresh_token', 'def')
    localStorage.setItem('user', '{}')
    clearAuthData()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})

describe('getStoredTokens', () => {
  it('returns stored tokens', () => {
    localStorage.setItem('token', 'abc')
    localStorage.setItem('refresh_token', 'def')
    const tokens = getStoredTokens()
    expect(tokens.token).toBe('abc')
    expect(tokens.refreshToken).toBe('def')
  })

  it('returns null for missing tokens', () => {
    const tokens = getStoredTokens()
    expect(tokens.token).toBeNull()
    expect(tokens.refreshToken).toBeNull()
  })
})

describe('getStoredUser', () => {
  it('returns parsed user', () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Joel' }))
    expect(getStoredUser()).toEqual({ name: 'Joel' })
  })

  it('returns null when no user stored', () => {
    expect(getStoredUser()).toBeNull()
  })

  it('returns null on parse error', () => {
    localStorage.setItem('user', 'invalid-json')
    expect(getStoredUser()).toBeNull()
  })
})
