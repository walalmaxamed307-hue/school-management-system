// Hal meel oo dhammaan wicitaannada backend-ka mara. Waxay qabataa:
// - Authorization header (token-ka localStorage)
// - JSON parse + khaladaadka backend-ka ({ error: '...' }) oo loo beddelo ApiError
// - 401 (token dhacay/aan sax ahayn) => session-ka waa la nadiifiyaa oo
//   AuthProvider ayaa loo sheegaa ('auth:expired')
// - network error (server ma shaqaynayo) => fariin cad oo Somali ah

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const TOKEN_KEY = 'auth_token'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage lama heli karo (private mode) — session-ku wuxuu noqon
    // doonaa mid ku-meel-gaar ah.
  }
}

async function request(method, path, { body, query, auth = true } = {}) {
  let url = BASE_URL + path
  if (query) {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, v)
    })
    const qs = params.toString()
    if (qs) url += '?' + qs
  }

  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Server-ka lama gaari karo. Hubi internet-ka ama isku day mar dambe.', 0)
  }

  let data = null
  if (res.status !== 204) {
    try {
      data = await res.json()
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken(null)
      window.dispatchEvent(new Event('auth:expired'))
    }
    const message = data?.error || `Khalad server-ka (${res.status})`
    throw new ApiError(message, res.status, data)
  }
  return data
}

export const api = {
  get: (path, query, opts) => request('GET', path, { query, ...opts }),
  post: (path, body, opts) => request('POST', path, { body: body ?? {}, ...opts }),
  put: (path, body, opts) => request('PUT', path, { body: body ?? {}, ...opts }),
  patch: (path, body, opts) => request('PATCH', path, { body: body ?? {}, ...opts }),
  delete: (path, opts) => request('DELETE', path, opts),
}
