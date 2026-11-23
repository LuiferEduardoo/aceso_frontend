import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'
import { apiUrl, server } from '@/test/server'
import type { Task } from './api/types'

const start = new Date('2026-11-25T09:00').toISOString()
const end = new Date('2026-11-25T10:30').toISOString()

const task: Task = {
  id: 8,
  title: 'Preparar informe',
  notes: null,
  status: 'todo',
  priority: 'high',
  due_date: '2026-11-26',
  scheduled_start: start,
  scheduled_end: end,
  completed_at: null,
  created_at: '2026-11-20T10:00:00Z',
  updated_at: '2026-11-20T10:00:00Z',
}

describe('tasks', () => {
  it('validates the schedule, creates a scheduled task and completes it', async () => {
    let tasks: Task[] = []
    let posted: unknown
    let completed = false
    const statusFilters: (string | null)[] = []
    server.use(
      http.get(apiUrl('/planner/tasks'), ({ request }) => {
        const status = new URL(request.url).searchParams.get('status')
        statusFilters.push(status)
        return HttpResponse.json(status ? tasks.filter((t) => t.status === status) : tasks)
      }),
      http.post(apiUrl('/planner/tasks'), async ({ request }) => {
        posted = await request.json()
        tasks = [task]
        return HttpResponse.json(task, { status: 201 })
      }),
      http.post(apiUrl('/planner/tasks/8/complete'), () => {
        completed = true
        tasks = [{ ...task, status: 'done', completed_at: '2026-11-25T11:00:00Z' }]
        return HttpResponse.json(tasks[0])
      }),
    )
    const { user } = renderApp({ route: '/planner/tasks' })

    expect(await screen.findByText('No hay tareas')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Nueva tarea' }))
    const dialog = screen.getByRole('dialog', { name: 'Nueva tarea' })
    await user.type(within(dialog).getByLabelText('Título'), 'Preparar informe')
    await user.selectOptions(within(dialog).getByLabelText('Prioridad'), 'high')
    await user.type(within(dialog).getByLabelText('Fecha límite'), '2026-11-26')
    await user.type(within(dialog).getByLabelText('Inicio'), '2026-11-25T09:00')
    await user.click(within(dialog).getByRole('button', { name: 'Crear tarea' }))

    expect(await within(dialog).findByText('Indica el inicio y el fin, o deja ambos vacíos')).toBeInTheDocument()
    expect(posted).toBeUndefined()

    await user.type(within(dialog).getByLabelText('Fin'), '2026-11-25T10:30')
    await user.click(within(dialog).getByRole('button', { name: 'Crear tarea' }))

    expect(await screen.findByText('Preparar informe')).toBeInTheDocument()
    expect(posted).toEqual({
      title: 'Preparar informe',
      notes: null,
      status: 'todo',
      priority: 'high',
      due_date: '2026-11-26',
      scheduled_start: start,
      scheduled_end: end,
    })

    await user.click(screen.getByRole('button', { name: 'Completar' }))
    expect(await screen.findByRole('button', { name: 'Reabrir' })).toBeInTheDocument()
    expect(completed).toBe(true)
    expect(within(screen.getByText('Preparar informe').closest('li')!).getByText('Hecha')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Filtrar por estado'), 'todo')
    expect(await screen.findByText('No hay tareas')).toBeInTheDocument()
    await waitFor(() => expect(statusFilters).toContain('todo'))
  })
})
