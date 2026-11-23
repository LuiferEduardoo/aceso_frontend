import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { todayIn } from '@/shared/lib/dates'
import { renderApp } from '@/test/renderApp'
import { apiUrl, server } from '@/test/server'
import { PLANNER_TIMEZONE, type AgendaDay, type Habit } from './api/types'

const day = todayIn(PLANNER_TIMEZONE)

const habit: Habit = {
  id: 5,
  name: 'Leer',
  description: null,
  frequency: 'weekdays',
  weekdays: [0, 2],
  times_per_week: null,
  target_count: 1,
  unit: null,
  start_date: day,
  time_of_day: null,
  duration_min: null,
  timezone: 'America/Bogota',
  sync_to_calendar: false,
  archived_at: null,
  created_at: '2026-11-01T10:00:00Z',
}

describe('habits', () => {
  it('creates a weekdays habit and toggles today’s check-in', async () => {
    let habits: Habit[] = []
    let count = 0
    let posted: unknown
    let logged: unknown
    let unlogged = false
    server.use(
      http.get(apiUrl('/planner/habits'), () => HttpResponse.json(habits)),
      http.post(apiUrl('/planner/habits'), async ({ request }) => {
        posted = await request.json()
        habits = [habit]
        return HttpResponse.json(habit, { status: 201 })
      }),
      http.get(apiUrl('/planner/agenda'), () => {
        const agenda: AgendaDay[] = [
          {
            date: day,
            events: [],
            tasks: [],
            habits: habits.map((h) => ({
              habit_id: h.id,
              name: h.name,
              time_of_day: null,
              duration_min: null,
              target_count: 1,
              count,
              completed: count >= 1,
            })),
          },
        ]
        return HttpResponse.json(agenda)
      }),
      http.post(apiUrl(`/planner/habits/5/logs/${day}`), async ({ request }) => {
        logged = await request.json()
        count = 1
        return HttpResponse.json({ id: 1, habit_id: 5, day, count: 1, note: null })
      }),
      http.delete(apiUrl(`/planner/habits/5/logs/${day}`), () => {
        unlogged = true
        count = 0
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { user } = renderApp({ route: '/planner/habits' })

    expect(await screen.findByText('Aún no hay hábitos')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Nuevo hábito' }))
    const dialog = screen.getByRole('dialog', { name: 'Nuevo hábito' })
    await user.type(within(dialog).getByLabelText('Nombre'), 'Leer')
    await user.selectOptions(within(dialog).getByLabelText('Frecuencia'), 'weekdays')
    await user.click(within(dialog).getByRole('button', { name: 'Crear hábito' }))

    expect(await within(dialog).findByText('Elige al menos un día')).toBeInTheDocument()
    expect(posted).toBeUndefined()

    await user.click(within(dialog).getByLabelText('Mié'))
    await user.click(within(dialog).getByLabelText('Lun'))
    await user.click(within(dialog).getByRole('button', { name: 'Crear hábito' }))

    const checkbox = await screen.findByRole('checkbox', { name: 'Hecho hoy' })
    expect(posted).toEqual({
      name: 'Leer',
      description: null,
      frequency: 'weekdays',
      weekdays: [0, 2],
      times_per_week: null,
      target_count: 1,
      unit: null,
      start_date: day,
      time_of_day: null,
      duration_min: null,
      timezone: 'America/Bogota',
      sync_to_calendar: false,
    })
    expect(screen.getByText('Lun, Mié · meta 1')).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Hecho hoy' })).toBeChecked())
    expect(logged).toEqual({ count: 1 })

    await user.click(screen.getByRole('checkbox', { name: 'Hecho hoy' }))
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Hecho hoy' })).not.toBeChecked())
    expect(unlogged).toBe(true)
  })

  it('shows the streak stats of a habit', async () => {
    server.use(
      http.get(apiUrl('/planner/habits/5'), () => HttpResponse.json(habit)),
      http.get(apiUrl('/planner/habits/5/stats'), () =>
        HttpResponse.json({
          streak_unit: 'day',
          current_streak: 4,
          best_streak: 9,
          completed: 12,
          expected: 16,
          completion_rate: 0.75,
        }),
      ),
    )
    renderApp({ route: '/planner/habits/5' })

    expect(await screen.findByRole('heading', { name: 'Leer' })).toBeInTheDocument()
    expect(await screen.findByText('4 días')).toBeInTheDocument()
    expect(screen.getByText('9 días')).toBeInTheDocument()
    expect(screen.getByText('12 / 16')).toBeInTheDocument()
    expect(screen.getByText('75 %')).toBeInTheDocument()
  })
})
