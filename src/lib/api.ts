const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000'

const ROOT = `${API_BASE_URL.replace(/\/$/, '')}/api/nammasambrama`

export const TOKEN_KEY = 'namma-sambrama:token'
export const ADMIN_KEY = 'namma-sambrama:admin'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore storage errors
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  } catch {
    // ignore storage errors
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Where to send an admin whose session is no longer valid. */
const LOGIN_PATH = '/login'

/**
 * Any 401 means the token is missing, invalid or expired — drop the session
 * and bounce to the login page. Handled here so no caller has to repeat it.
 */
function handleUnauthorized() {
  clearSession()
  if (window.location.pathname !== LOGIN_PATH) {
    window.location.replace(LOGIN_PATH)
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  /** Attach the bearer token. Off for public-site calls. */
  auth?: boolean
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, signal } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    const token = getToken()
    // No token at all on a protected call — same outcome as a rejected one
    if (!token) {
      handleUnauthorized()
      throw new ApiError('Not authenticated', 401)
    }
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${ROOT}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiError('Network error — please check your connection', 0)
  }

  if (response.status === 401) {
    handleUnauthorized()
    throw new ApiError('Session expired. Please log in again.', 401)
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(
      (payload as { error?: string }).error || `Request failed (${response.status})`,
      response.status,
    )
  }

  return payload as T
}

/** Multipart upload — Content-Type is set by the browser, not by us. */
async function uploadFile(file: File): Promise<{ url: string; publicId: string }> {
  const token = getToken()
  if (!token) {
    handleUnauthorized()
    throw new ApiError('Not authenticated', 401)
  }

  const form = new FormData()
  form.append('file', file)

  let response: Response
  try {
    response = await fetch(`${ROOT}/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
  } catch {
    throw new ApiError('Upload failed — please check your connection', 0)
  }

  if (response.status === 401) {
    handleUnauthorized()
    throw new ApiError('Session expired. Please log in again.', 401)
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError((payload as { error?: string }).error || 'Upload failed', response.status)
  }

  return payload as { url: string; publicId: string }
}

export const api = {
  get: <T>(path: string, auth = false, signal?: AbortSignal) =>
    request<T>(path, { method: 'GET', auth, signal }),
  post: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'PUT', body, auth }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'PATCH', body, auth }),
  del: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'DELETE', body, auth }),
  uploadFile,
}
