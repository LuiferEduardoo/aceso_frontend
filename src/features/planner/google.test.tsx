import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { browser } from '@/shared/lib/browser'
import { renderApp } from '@/test/renderApp'
import { apiUrl, server } from '@/test/server'
import type { GoogleCalendar } from './api/types'

const calendars: GoogleCalendar[] = [
  { id: 'primary-id', summary: 'Personal', primary: true, access_role: 'owner', writable: true },
  { id: 'holidays', summary: 'Festivos', primary: false, access_role: 'reader', writable: false },
  { id: 'work', summary: 'Trabajo', primary: false, access_role: 'writer', writable: true },
]

describe('google calendar panel', () => {
  afterEach(() => vi.restoreAllMocks())

  it('reports a missing connection and sends the user to the Google consent page', async () => {
    const assign = vi.spyOn(browser, 'assign').mockImplementation(() => {})
    server.use(
      http.get(apiUrl('/planner/agenda'), () => HttpResponse.json([])),
      http.get(apiUrl('/planner/google/calendars'), () =>
        HttpResponse.json({ detail: 'Google account is not connected' }, { status: 404 }),
      ),
      http.get(apiUrl('/planner/google/authorize'), () =>
        HttpResponse.json({ authorization_url: 'https://accounts.google.com/o/oauth2/auth?state=abc' }),
      ),
    )
    const { user } = renderApp({ route: '/planner/agenda' })

    expect(await screen.findByText('No hay una cuenta de Google conectada.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Conectar Google Calendar' }))

    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/auth?state=abc'))
  })

  it('chooses a writable calendar and syncs now', async () => {
    let selected: unknown
    server.use(
      http.get(apiUrl('/planner/agenda'), () => HttpResponse.json([])),
      http.get(apiUrl('/planner/google/calendars'), () => HttpResponse.json(calendars)),
      http.put(apiUrl('/planner/google/calendar'), async ({ request }) => {
        selected = await request.json()
        return HttpResponse.json({ calendar_id: 'work', last_synced_at: null })
      }),
      http.post(apiUrl('/planner/google/sync'), () => HttpResponse.json({ pulled: 3, pushed: 2, deleted: 1 })),
    )
    const { user } = renderApp({ route: '/planner/agenda' })

    const select = await screen.findByLabelText('Calendario a sincronizar')
    expect([...(select as HTMLSelectElement).options].map((option) => option.textContent)).toEqual([
      'Elige un calendario…',
      'Personal (principal)',
      'Trabajo',
    ])
    await user.selectOptions(select, 'work')
    await user.click(screen.getByRole('button', { name: 'Usar calendario' }))

    expect(await screen.findByText('Calendario elegido: Trabajo.')).toBeInTheDocument()
    expect(selected).toEqual({ calendar_id: 'work' })

    await user.click(screen.getByRole('button', { name: 'Sincronizar ahora' }))
    expect(
      await screen.findByText('Sincronización completa: 3 cambios recibidos, 2 enviados y 1 eliminados en Google.'),
    ).toBeInTheDocument()
  })
})
