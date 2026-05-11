const API_BASE = 'https://buenex-my-apis.duckdns.org/fit-community/api'

function getToken() {
  return localStorage.getItem('community_fit_token')
}

export function getSessionUser() {
  const raw = localStorage.getItem('community_fit_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSession({ user, token }) {
  localStorage.setItem('community_fit_token', token)
  localStorage.setItem('community_fit_user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('community_fit_token')
  localStorage.removeItem('community_fit_user')
}

function authHeaders() {
  const t = getToken()
  const h = { 'Content-Type': 'application/json' }
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

async function parseError(res) {
  try {
    const j = await res.json()
    return j.error || res.statusText
  } catch {
    return res.statusText
  }
}

export async function postSession(login, password) {
  const res = await fetch(`${API_BASE}/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function fetchMine() {
  const res = await fetch(`${API_BASE}/communities/mine`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function createCommunity(name) {
  const res = await fetch(`${API_BASE}/communities`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function joinCommunity(inviteCode) {
  const res = await fetch(`${API_BASE}/communities/join`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ inviteCode }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function fetchCommunity(id) {
  const res = await fetch(`${API_BASE}/communities/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function patchCommunity(id, body) {
  const res = await fetch(`${API_BASE}/communities/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function postCheckin(communityId, date) {
  const res = await fetch(`${API_BASE}/communities/${communityId}/checkins`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ date }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function postNotification(communityId, message) {
  const res = await fetch(`${API_BASE}/communities/${communityId}/notifications`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}
