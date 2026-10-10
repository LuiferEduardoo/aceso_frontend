import createClient, { type Middleware } from 'openapi-fetch'
import { tokenStore } from '@/shared/auth/tokenStore'
import { ApiError, normalizeApiError, toNetworkError } from './errors'
import type { components, paths } from './schema'

export type Schemas = components['schemas']

/** Resolves VITE_API_URL (default `/api`) into an absolute base URL. */
export function resolveApiBaseUrl(raw: string | undefined = import.meta.env.VITE_API_URL): string {
  const base = raw && raw.trim() !== '' ? raw : '/api'
  return new URL(base, window.location.origin).toString().replace(/\/$/, '')
}

const PUBLIC_PATHS = ['/auth/login', '/auth/register']

function isPublicRequest(request: Request): boolean {
  const { pathname } = new URL(request.url)
  return PUBLIC_PATHS.some((path) => pathname.endsWith(path))
}

export const authMiddleware: Middleware = {
  onRequest({ request }) {
    const token = tokenStore.get()
    if (token && !isPublicRequest(request)) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
  onResponse({ request, response }) {
    // Any 401 on an authenticated call means the token is gone or expired.
    if (response.status === 401 && !isPublicRequest(request)) {
      tokenStore.clear()
    }
    return response
  },
}

export const api = createClient<paths>({
  baseUrl: resolveApiBaseUrl(),
  // Resolve fetch lazily so test interceptors (msw) and polyfills are picked up.
  fetch: (input: Request) => globalThis.fetch(input),
})
api.use(authMiddleware)

interface ApiResult<T> {
  data?: T
  error?: unknown
  response: Response
}

/** Awaits an openapi-fetch call and returns its data or throws a normalized ApiError. */
export async function unwrap<T>(call: Promise<ApiResult<T>>): Promise<NonNullable<T>> {
  let result: ApiResult<T>
  try {
    result = await call
  } catch (cause) {
    if (cause instanceof ApiError) throw cause
    throw toNetworkError(cause)
  }
  if (!result.response.ok) {
    throw normalizeApiError(result.response.status, result.error)
  }
  return result.data as NonNullable<T>
}
