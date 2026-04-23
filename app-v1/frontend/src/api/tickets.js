const API = '/api'

export async function createTicket(data) {
  const res = await fetch(`${API}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to create ticket')
  return json
}

export async function getTicket(id) {
  const res = await fetch(`${API}/tickets/${id}`, { credentials: 'include' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ticket not found')
  return json
}

export async function getMyTickets() {
  const res = await fetch(`${API}/tickets`, { credentials: 'include' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to load tickets')
  return json
}

export async function searchTickets(query) {
  const res = await fetch(`${API}/tickets/search/query?q=${encodeURIComponent(query)}`, {
    credentials: 'include'
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Search failed')
  return json
}

export async function updateTicket(id, updates) {
  const res = await fetch(`${API}/tickets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to update ticket')
  return json
}

export async function deleteTicket(id) {
  const res = await fetch(`${API}/tickets/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to delete ticket')
  return json
}
