export function storeAuthData(res) {
  localStorage.setItem('token', res.access_token)
  localStorage.setItem('refresh_token', res.refresh_token)
  localStorage.setItem('user', JSON.stringify(res.user))
}

export function clearAuthData() {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

export function getStoredTokens() {
  return {
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refresh_token'),
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
