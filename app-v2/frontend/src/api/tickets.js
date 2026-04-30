const API = '/api'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export async function createTicket(data) {
  const res = await fetch(`${API}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to create ticket')
  return json
}

export async function getTicket(id) {
  const res = await fetch(`${API}/tickets/${id}`, {
    headers: getAuthHeaders()
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ticket not found')
  return json
}

export async function getMyTickets() {
  const res = await fetch(`${API}/tickets`, {
    headers: getAuthHeaders()
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to load tickets')
  return json
}

export async function searchTickets(query) {
  const res = await fetch(`${API}/tickets/search/query?q=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders()
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Search failed')
  return json
}

export async function updateTicket(id, updates) {
  const res = await fetch(`${API}/tickets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(updates)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to update ticket')
  return json
}

export async function deleteTicket(id) {
  const res = await fetch(`${API}/tickets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to delete ticket')
  return json
}
