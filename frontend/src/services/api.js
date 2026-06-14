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
    if (res.status === 409) {
      return { __conflict: true, status: 409, detail: err.detail || 'Conflict' }
    }
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

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
