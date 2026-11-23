import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { browser } from '@/shared/lib/browser'
import { formatDateTime } from '@/shared/lib/format'
import { renderApp } from '@/test/renderApp'
import { apiUrl, server } from '@/test/server'
import type { GoogleCalendar, GoogleStatus } from './api/types'

const calendars: GoogleCalendar[] = [
  { id: 'primary-id', summary: 'Personal', primary: true, access_role: 'owner', writable: true },
  { id: 'holidays', summary: 'Festivos', primary: false, access_role: 'reader', writable: false },
  { id: 'work', summary: 'Trabajo', primary: false, access_role: 'writer', writable: true },
]

const disconnected: GoogleStatus = { connected: false, calendar_id: null, last_synced_at: null }
const LAST_SYNC = '2026-11-20T14:30:00Z'

function mockAgenda(status: GoogleStatus) {
  let statusCalls = 0
  server.use(
    http.get(apiUrl('/planner/agenda'), () => HttpResponse.json([])),
    http.get(apiUrl('/planner/google/status'), () => {
      statusCalls += 1
      return HttpResponse.json(status)
    }),
  )
  return { statusCalls: () => statusCalls }
}

describe('google calendar panel', () => {
  afterEach(() => vi.restoreAllMocks())

  it('reports a missing connection and sends the user to the Google consent page', async () => {
    const assign = vi.spyOn(browser, 'assign').mockImplementation(() => {})
    mockAgenda(disconnected)
    server.use(
      http.get(apiUrl('/planner/google/calendars'), () => {
        throw new Error('calendars must not be requested while disconnected')
      }),
      http.get(apiUrl('/planner/google/authorize'), () =>
        HttpResponse.json({ authorization_url: 'https://accounts.google.com/o/oauth2/auth?state=abc' }),
      ),
    )
    const { user } = renderApp({ route: '/planner/agenda' })

    expect(await screen.findByText('No hay una cuenta de Google conectada.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sincronizar ahora' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Conectar Google Calendar' }))

    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/auth?state=abc'))
  })

  it('preselects the linked calendar and shows the last sync', async () => {
    mockAgenda({ connected: true, calendar_id: 'primary', last_synced_at: LAST_SYNC })
    server.use(http.get(apiUrl('/planner/google/calendars'), () => HttpResponse.json(calendars)))
    renderApp({ route: '/planner/agenda' })

    const select = await screen.findByLabelText<HTMLSelectElement>('Calendario a sincronizar')
    await waitFor(() => expect(select.value).toBe('primary-id'))
    expect(screen.getByText(`Última sincronización: ${formatDateTime(LAST_SYNC)}`)).toBeInTheDocument()
    expect(screen.queryByText('No hay una cuenta de Google conectada.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Conectar Google Calendar' })).not.toBeInTheDocument()
  })

  it('chooses a writable calendar, syncs now and refreshes the status', async () => {
    let selected: unknown
    const status = mockAgenda({ connected: true, calendar_id: 'work', last_synced_at: null })
    server.use(
      http.get(apiUrl('/planner/google/calendars'), () => HttpResponse.json(calendars)),
      http.put(apiUrl('/planner/google/calendar'), async ({ request }) => {
        selected = await request.json()
        return HttpResponse.json({ calendar_id: 'primary-id', last_synced_at: null })
      }),
      http.post(apiUrl('/planner/google/sync'), () => HttpResponse.json({ pulled: 3, pushed: 2, deleted: 1 })),
    )
    const { user } = renderApp({ route: '/planner/agenda' })

    const select = await screen.findByLabelText<HTMLSelectElement>('Calendario a sincronizar')
    await waitFor(() => expect(select.value).toBe('work'))
    expect(screen.getByText('Aún no se ha sincronizado.')).toBeInTheDocument()
    expect([...select.options].map((option) => option.textContent)).toEqual([
      'Elige un calendario…',
      'Personal (principal)',
      'Trabajo',
    ])
    await user.selectOptions(select, 'primary-id')
    await user.click(screen.getByRole('button', { name: 'Usar calendario' }))

    expect(await screen.findByText('Calendario elegido: Personal.')).toBeInTheDocument()
    expect(selected).toEqual({ calendar_id: 'primary-id' })
    await waitFor(() => expect(status.statusCalls()).toBeGreaterThanOrEqual(2))
    const beforeSync = status.statusCalls()

    await user.click(screen.getByRole('button', { name: 'Sincronizar ahora' }))
    expect(
      await screen.findByText('Sincronización completa: 3 cambios recibidos, 2 enviados y 1 eliminados en Google.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(status.statusCalls()).toBeGreaterThan(beforeSync))
  })
})

describe('google oauth return', () => {
  it('announces a successful connection and clears the query string', async () => {
    mockAgenda(disconnected)
    const { router } = renderApp({ route: '/planner/agenda?google=connected' })

    expect(await screen.findByText('Google Calendar conectado')).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.search).toBe(''))
    expect(router.state.location.pathname).toBe('/planner/agenda')
    expect(screen.getByText('Google Calendar conectado')).toBeInTheDocument()
  })

  it.each([
    ['access_denied', 'Cancelaste la autorización en Google; Google Calendar no se conectó.'],
    ['missing_scope', 'No se concedió acceso a Google Calendar. Conéctalo de nuevo y acepta el permiso del calendario.'],
    ['invalid_state', 'El enlace de autorización no es válido o expiró. Vuelve a conectar Google Calendar.'],
    ['exchange_failed', 'No se pudo completar la conexión con Google. Inténtalo de nuevo.'],
    ['something_new', 'No se pudo conectar Google Calendar. Inténtalo de nuevo.'],
  ])('explains the %s error and clears the query string', async (reason, message) => {
    mockAgenda(disconnected)
    const { router } = renderApp({ route: `/planner/agenda?google=error&reason=${reason}` })

    expect(await screen.findByText(message)).toHaveAttribute('role', 'alert')
    await waitFor(() => expect(router.state.location.search).toBe(''))
    expect(screen.getByText(message)).toBeInTheDocument()
  })
})
