const API_BASE = '/api'

export const authAPI = {
  async register(email, password) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    return response.json()
  },

  async logout() {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    return response.json()
  },

  async getMe() {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Not authenticated')
    return response.json()
  },

  async forgotPassword(email) {
    const response = await fetch(`${API_BASE}/password/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    return response.json()
  },

  async resetPassword(token, newPassword) {
    const response = await fetch(`${API_BASE}/password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    })
    return response.json()
  }
}
