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
      body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    return data
  },

  async logout() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    localStorage.removeItem('token')
    return response.json()
  },

  async getMe() {
    const token = localStorage.getItem('token')
    const headers = new Headers()
    if (token) {
      headers.append('Authorization', `Bearer ${token}`)
    }
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers,
      mode: 'cors',
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
