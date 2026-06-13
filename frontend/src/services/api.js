const API_BASE = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
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
