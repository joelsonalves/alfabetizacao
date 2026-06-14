import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '../services/api'

beforeEach(() => {
  localStorage.clear()
  global.fetch = vi.fn()
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
})
