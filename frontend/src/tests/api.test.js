import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from '../services/api'

beforeEach(() => {
  localStorage.clear()
  global.fetch = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('api service', () => {
  it('auth.register sends correct request', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'token', user: { id: 1 } }),
    })

    const result = await api.auth.register({ name: 'Test', email: 'test@test.com', password: '123456' })
    expect(result.access_token).toBe('token')
    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String),
      })
    )
  })

  it('auth.login sends correct request', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'token', user: { id: 1 } }),
    })

    const result = await api.auth.login({ email: 'test@test.com', password: '123456' })
    expect(result.access_token).toBe('token')
  })

  it('includes auth token in headers when available', async () => {
    localStorage.setItem('token', 'test-token')
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    })

    await api.auth.me()
    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    )
  })

  it('throws error on non-ok response', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: 'Email already registered' }),
    })

    await expect(api.auth.register({ name: 'X', email: 'x@x.com', password: '123456' })).rejects.toThrow('Email already registered')
  })

  it('modules.list returns modules', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'Vogais' }]),
    })

    const result = await api.modules.list()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Vogais')
  })

  it('returns __conflict on 409', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ detail: 'Conflito: versão desatualizada' }),
    })

    const result = await api.progress.update(1, { score: 10, version: 0 })
    expect(result.__conflict).toBe(true)
    expect(result.status).toBe(409)
    expect(result.detail).toContain('Conflito')
  })

  it('clears tokens and redirects when refresh fails', async () => {
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('refresh_token', 'expired-refresh')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: 'Unauthorized' }),
    })

    const originalLocation = window.location
    delete window.location
    window.location = { href: '' }

    await expect(api.auth.me()).rejects.toThrow('Unauthorized')
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(window.location.href).toBe('/login')

    window.location = originalLocation
  })

  it('refreshes token and retries on 401', async () => {
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('refresh_token', 'valid-refresh')

    let callCount = 0
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ detail: 'Unauthorized' }),
        })
      }
      if (callCount === 2) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            access_token: 'new-token',
            refresh_token: 'new-refresh',
            user: { id: 1, name: 'Test' },
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      })
    })

    const result = await api.auth.me()
    expect(result).toEqual({ id: 1 })
    expect(callCount).toBe(3)
    expect(localStorage.getItem('token')).toBe('new-token')
  })
})
