import { screen, waitFor, within } from '@testing-library/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { today } from '@/shared/lib/dates'
import { renderApp } from '@/test/renderApp'
import { apiUrl, server } from '@/test/server'
import type { AgendaDay, CalendarEvent, Task } from './api/types'

const day = today()

const event: CalendarEvent = {
  id: 1,
  title: 'Dentista',
  description: null,
  location: 'Clínica',
  start_at: new Date(`${day}T15:00`).toISOString(),
  end_at: new Date(`${day}T16:00`).toISOString(),
  all_day: false,
  source: 'local',
  task_id: null,
  habit_id: null,
  google_event_id: null,
  sync_pending: false,
  created_at: '2026-11-01T10:00:00Z',
  updated_at: '2026-11-01T10:00:00Z',
}

const task: Task = {
  id: 8,
  title: 'Pagar arriendo',
  notes: null,
  status: 'todo',
  priority: 'medium',
  due_date: day,
  scheduled_start: null,
  scheduled_end: null,
  completed_at: null,
  created_at: '2026-11-01T10:00:00Z',
  updated_at: '2026-11-01T10:00:00Z',
}

describe('agenda', () => {
  it('renders the events, tasks and habits of each day and opens the day detail', async () => {
    let requested: URLSearchParams | undefined
    server.use(
      http.get(apiUrl('/planner/agenda'), ({ request }) => {
        requested = new URL(request.url).searchParams
        const agenda: AgendaDay[] = [
          {
            date: day,
            events: [event],
            tasks: [task],
            habits: [
              {
                habit_id: 5,
                name: 'Meditar',
                time_of_day: '07:00:00',
                duration_min: 10,
                target_count: 1,
                count: 1,
                completed: true,
              },
            ],
          },
        ]
        return HttpResponse.json(agenda)
      }),
      http.get(apiUrl('/planner/google/calendars'), () =>
        HttpResponse.json({ detail: 'Google account is not connected' }, { status: 404 }),
      ),
    )
    const { user } = renderApp({ route: '/planner' })

    expect(await screen.findByText('15:00 Dentista')).toBeInTheDocument()
    expect(screen.getByText('Pagar arriendo')).toBeInTheDocument()
    expect(screen.getByText(/Meditar/)).toBeInTheDocument()
    // The whole visible month grid is requested at once.
    expect(requested?.get('from') ?? '').not.toBe('')
    expect((requested?.get('from') ?? '') <= day && (requested?.get('to') ?? '') >= day).toBe(true)

    const label = `Ver el ${format(new Date(`${day}T12:00`), "d 'de' MMMM", { locale: es })}`
    await user.click(screen.getByRole('button', { name: label }))
    const dialog = await screen.findByRole('dialog', { name: /^Agenda del / })
    expect(within(dialog).getByText('Dentista')).toBeInTheDocument()
    expect(within(dialog).getByText('15:00–16:00')).toBeInTheDocument()
    expect(within(dialog).getByText('Pagar arriendo')).toBeInTheDocument()
    expect(within(dialog).getByText('Cumplido')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Editar Dentista' })).toBeInTheDocument()
  })

  it('creates an event from the events page and locks linked events', async () => {
    let events: CalendarEvent[] = [{ ...event, id: 2, title: 'Pagar arriendo', task_id: 8 }]
    let posted: unknown
    server.use(
      http.get(apiUrl('/planner/events'), () => HttpResponse.json(events)),
      http.post(apiUrl('/planner/events'), async ({ request }) => {
        posted = await request.json()
        events = [...events, event]
        return HttpResponse.json(event, { status: 201 })
      }),
    )
    const { user } = renderApp({ route: '/planner/events' })

    const linked = (await screen.findByText('Pagar arriendo')).closest('li')!
    expect(within(linked).getByRole('button', { name: 'Editar' })).toBeDisabled()
    expect(within(linked).getByRole('button', { name: 'Eliminar' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Nuevo evento' }))
    const dialog = screen.getByRole('dialog', { name: 'Nuevo evento' })
    await user.type(within(dialog).getByLabelText('Título'), 'Dentista')
    await user.type(within(dialog).getByLabelText('Ubicación'), 'Clínica')
    await user.clear(within(dialog).getByLabelText('Inicio'))
    await user.type(within(dialog).getByLabelText('Inicio'), `${day}T15:00`)
    await user.clear(within(dialog).getByLabelText('Fin'))
    await user.type(within(dialog).getByLabelText('Fin'), `${day}T16:00`)
    await user.click(within(dialog).getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findByText('Dentista')).toBeInTheDocument()
    await waitFor(() =>
      expect(posted).toEqual({
        title: 'Dentista',
        description: null,
        location: 'Clínica',
        start_at: event.start_at,
        end_at: event.end_at,
        all_day: false,
      }),
    )
  })
})
