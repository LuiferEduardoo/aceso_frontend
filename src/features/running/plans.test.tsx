import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'
import { apiUrl, server } from '@/test/server'
import type { TrainingPlan } from './api/types'

const plan: TrainingPlan = {
  id: 3,
  name: 'Half marathon',
  goal: 'Sub 1:45',
  start_date: '2026-11-01',
  end_date: '2026-12-31',
  runs: [],
  created_at: '2026-10-08T10:00:00Z',
}

describe('training plans', () => {
  it('validates the date order, creates the plan and opens its detail page', async () => {
    let posted: unknown
    server.use(
      http.get(apiUrl('/running/plans'), () => HttpResponse.json([])),
      http.post(apiUrl('/running/plans'), async ({ request }) => {
        posted = await request.json()
        return HttpResponse.json(plan, { status: 201 })
      }),
      http.get(apiUrl('/running/plans/3'), () => HttpResponse.json(plan)),
    )
    const { user, router } = renderApp({ route: '/running/plans' })

    await user.click(await screen.findByRole('button', { name: 'Nuevo plan' }))
    const dialog = screen.getByRole('dialog', { name: 'Nuevo plan de entrenamiento' })
    await user.type(within(dialog).getByLabelText('Nombre'), 'Half marathon')
    await user.type(within(dialog).getByLabelText('Objetivo'), 'Sub 1:45')
    await user.type(within(dialog).getByLabelText('Fecha de inicio'), '2026-12-31')
    await user.type(within(dialog).getByLabelText('Fecha de fin'), '2026-11-01')
    await user.click(within(dialog).getByRole('button', { name: 'Crear plan' }))

    expect(await within(dialog).findByText('La fecha de fin debe ser igual o posterior a la de inicio')).toBeInTheDocument()
    expect(posted).toBeUndefined()

    await user.clear(within(dialog).getByLabelText('Fecha de inicio'))
    await user.type(within(dialog).getByLabelText('Fecha de inicio'), '2026-11-01')
    await user.clear(within(dialog).getByLabelText('Fecha de fin'))
    await user.type(within(dialog).getByLabelText('Fecha de fin'), '2026-12-31')
    await user.click(within(dialog).getByRole('button', { name: 'Crear plan' }))

    expect(await screen.findByRole('heading', { name: 'Half marathon' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/running/plans/3')
    expect(posted).toEqual({
      name: 'Half marathon',
      goal: 'Sub 1:45',
      start_date: '2026-11-01',
      end_date: '2026-12-31',
      runs: [],
    })
  })
})
