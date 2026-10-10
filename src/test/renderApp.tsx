import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from '@/app/AppProviders'
import { routes } from '@/app/routes'
import { tokenStore } from '@/shared/auth/tokenStore'
import { createQueryClient } from '@/shared/lib/queryClient'
import { apiUrl, server } from './server'

export const TEST_USER = { id: 1, email: 'runner@example.com', created_at: '2026-01-01T00:00:00Z' }

interface RenderAppOptions {
  route: string
  /** Start with a stored session token. */
  signedIn?: boolean
}

/** Renders the real route tree in memory with fresh providers. */
export function renderApp({ route, signedIn = true }: RenderAppOptions) {
  if (signedIn) tokenStore.set('test-token')
  server.use(http.get(apiUrl('/auth/me'), () => HttpResponse.json(TEST_USER)))
  const router = createMemoryRouter(routes, { initialEntries: [route] })
  const client = createQueryClient()
  client.setDefaultOptions({ queries: { retry: false, staleTime: 0 }, mutations: { retry: false } })
  const user = userEvent.setup()
  const utils = render(
    <AppProviders client={client}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { ...utils, user, router }
}
