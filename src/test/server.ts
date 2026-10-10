import { setupServer } from 'msw/node'
import { resolveApiBaseUrl } from '@/shared/api/client'

export const server = setupServer()

/** Absolute URL of a backend path as the SPA calls it (through the /api prefix). */
export function apiUrl(path: string): string {
  return `${resolveApiBaseUrl()}${path}`
}
