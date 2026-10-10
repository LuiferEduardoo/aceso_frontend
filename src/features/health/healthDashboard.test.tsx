import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'
import { apiUrl, server } from '@/test/server'
import type { DailySummary } from './api/types'

const summary = (day: string, steps: number, restingHr: number): DailySummary => ({
  day,
  source: 'garmin',
  steps,
  distance_m: 8200,
  calories_active: 540,
  calories_total: 2400,
  active_minutes: 62,
  resting_hr: restingHr,
  avg_hr: 71,
  max_hr: 158,
  stress_avg: 28,
})

describe('health dashboard', () => {
  it('requests summaries for the range and renders them in the table', async () => {
    const queries: URLSearchParams[] = []
    server.use(
      http.get(apiUrl('/health/summaries'), ({ request }) => {
        queries.push(new URL(request.url).searchParams)
        return HttpResponse.json([summary('2026-10-06', 11234, 52), summary('2026-10-07', 9876, 51)])
      }),
      http.get(apiUrl('/health/sleep'), () => HttpResponse.json([])),
      http.get(apiUrl('/health/samples'), () => HttpResponse.json([])),
    )
    renderApp({ route: '/health' })

    const table = await screen.findByRole('table', { name: 'Resúmenes diarios' })
    expect(within(table).getByText('11234')).toBeInTheDocument()
    expect(within(table).getByText('9876')).toBeInTheDocument()
    expect(within(table).getAllByText('8.20 km')).toHaveLength(2)
    expect(screen.getByText('No hay sesiones de sueño en este rango')).toBeInTheDocument()

    expect(queries[0].get('from')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(queries[0].get('to')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(queries[0].has('source')).toBe(false)
  })

  it('blocks summary ranges longer than the backend limit', async () => {
    server.use(
      http.get(apiUrl('/health/summaries'), () => HttpResponse.json([])),
      http.get(apiUrl('/health/sleep'), () => HttpResponse.json([])),
      http.get(apiUrl('/health/samples'), () => HttpResponse.json([])),
    )
    const { user } = renderApp({ route: '/health' })

    const form = await screen.findByRole('form', { name: 'Rango de fechas: Aplicar' })
    const from = within(form).getByLabelText('Desde')
    await user.clear(from)
    await user.type(from, '2024-01-01')
    await user.click(within(form).getByRole('button', { name: 'Aplicar' }))

    expect(await within(form).findByText('El rango puede abarcar como máximo 366 días.')).toBeInTheDocument()
  })
})
