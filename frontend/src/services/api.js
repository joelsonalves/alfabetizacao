let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(newToken) {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback)
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (res.status === 401 && !options._retry && !path.endsWith('/auth/login')) {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          })
          if (refreshRes.ok) {
            const data = await refreshRes.json()
            localStorage.setItem('token', data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)
            localStorage.setItem('user', JSON.stringify(data.user))
            isRefreshing = false
            onRefreshed(data.access_token)
            return request(path, { ...options, _retry: true, headers: { ...options.headers, 'Authorization': `Bearer ${data.access_token}` } })
          } else {
            throw new Error('Refresh failed')
          }
        } catch {
          isRefreshing = false
          refreshSubscribers = []
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
      } else {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            resolve(request(path, { ...options, _retry: true, headers: { ...options.headers, 'Authorization': `Bearer ${newToken}` } }))
          })
        })
      }
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    if (res.status === 409) {
      return { __conflict: true, status: 409, detail: err.detail || 'Conflict' }
    }
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

const API_BASE = '/api'

export async function updateProgressWithRetry(lessonId, data, retries = 1) {
  const result = await api.progress.update(lessonId, data)
  if (result && result.__conflict && retries > 0) {
    const progressList = await api.progress.get()
    const current = Array.isArray(progressList)
      ? progressList.find(p => p.lesson_id === Number(lessonId))
      : progressList
    if (current && current.version !== undefined) {
      data.version = current.version
      return updateProgressWithRetry(lessonId, data, retries - 1)
    }
    throw new Error(result.detail || 'Erro de concorrência')
  }
  return result
}

export const api = {
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    refresh: (refreshToken) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) }),
    logout: (refreshToken) => request('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) }),
    me: () => request('/auth/me'),
  },
  modules: {
    list: () => request('/modules'),
    lessons: (moduleId) => request(`/modules/${moduleId}/lessons`),
    getLesson: (lessonId) => request(`/lessons/${lessonId}`),
  },
  progress: {
    update: (lessonId, data) => request(`/progress/lesson/${lessonId}`, { method: 'POST', body: JSON.stringify(data) }),
    get: () => request('/progress'),
    achievements: () => request('/progress/achievements'),
    unlockAchievement: (type) => request(`/progress/achievements/${type}`, { method: 'POST' }),
  },
  images: {
    emoji: (letter) => request(`/images/emoji/${letter}`),
    word: (word) => request(`/images/word/${word}`),
  },
}
