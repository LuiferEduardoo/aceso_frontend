import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'
import { apiUrl, server } from '@/test/server'
import type { Exercise } from './api/types'

const created: Exercise = {
  id: 7,
  name: 'Back squat',
  muscle_group: 'quadriceps',
  secondary_muscles: ['glutes'],
  equipment: 'barbell',
  exercise_type: 'compound',
  instructions: 'Low bar',
  image_url: null,
  created_at: '2026-10-01T10:00:00Z',
}

describe('exercises', () => {
  it('creates an exercise and shows it in the list', async () => {
    const exercises: Exercise[] = []
    let posted: unknown
    let uploaded = false
    server.use(
      http.get(apiUrl('/gym/exercises'), () => HttpResponse.json(exercises)),
      http.post(apiUrl('/gym/exercises'), async ({ request }) => {
        posted = await request.json()
        exercises.push(created)
        return HttpResponse.json(created, { status: 201 })
      }),
      http.put(apiUrl('/gym/exercises/7/photo'), () => {
        uploaded = true
        return HttpResponse.json({ ...created, image_url: '/gym/exercises/7/photo' })
      }),
    )
    const { user } = renderApp({ route: '/gym/exercises' })

    expect(await screen.findByText('Aún no hay ejercicios')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Nuevo ejercicio' }))
    const dialog = screen.getByRole('dialog', { name: 'Nuevo ejercicio' })

    await user.click(within(dialog).getByRole('button', { name: 'Crear ejercicio' }))
    expect(await within(dialog).findByText('El nombre es obligatorio')).toBeInTheDocument()

    expect(within(dialog).getByText('Elige el grupo muscular')).toBeInTheDocument()
    expect(within(dialog).getByText('Elige el equipamiento')).toBeInTheDocument()
    expect(within(dialog).getByText('Elige el tipo de ejercicio')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Nombre'), 'Back squat')
    await user.selectOptions(within(dialog).getByLabelText('Grupo muscular'), 'quadriceps')
    // The primary muscle is not offered as a secondary one.
    expect(within(dialog).queryByRole('checkbox', { name: 'Cuádriceps' })).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole('checkbox', { name: 'Glúteos' }))
    await user.selectOptions(within(dialog).getByLabelText('Equipamiento'), 'barbell')
    await user.selectOptions(within(dialog).getByLabelText('Tipo de ejercicio'), 'compound')
    await user.type(within(dialog).getByLabelText('Instrucciones'), 'Low bar')
    // The photo is picked before the exercise exists and uploaded right after creating it.
    await user.upload(
      within(dialog).getByLabelText('Elegir foto'),
      new File(['photo'], 'squat.png', { type: 'image/png' }),
    )
    expect(within(dialog).getByAltText('Vista previa de la foto')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Crear ejercicio' }))

    await waitFor(() => expect(uploaded).toBe(true))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(posted).toEqual({
      name: 'Back squat',
      muscle_group: 'quadriceps',
      secondary_muscles: ['glutes'],
      equipment: 'barbell',
      exercise_type: 'compound',
      instructions: 'Low bar',
    })

    const item = (await screen.findByText('Back squat')).closest('li')
    expect(item).not.toBeNull()
    for (const text of ['Cuádriceps', 'Barra', 'Compuesto', 'Secundarios: Glúteos', 'Low bar']) {
      expect(within(item as HTMLElement).getByText(text)).toBeInTheDocument()
    }
  })

  it('drops a secondary muscle when it becomes the primary one', async () => {
    let patched: unknown
    server.use(
      http.get(apiUrl('/gym/exercises'), () => HttpResponse.json([created])),
      http.patch(apiUrl('/gym/exercises/7'), async ({ request }) => {
        patched = await request.json()
        return HttpResponse.json({ ...created, ...(patched as object) })
      }),
    )
    const { user } = renderApp({ route: '/gym/exercises' })

    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    const dialog = screen.getByRole('dialog', { name: 'Editar ejercicio' })
    expect(within(dialog).getByRole('checkbox', { name: 'Glúteos' })).toBeChecked()

    await user.selectOptions(within(dialog).getByLabelText('Grupo muscular'), 'glutes')
    expect(within(dialog).queryByRole('checkbox', { name: 'Glúteos' })).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole('checkbox', { name: 'Cuádriceps' }))
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(patched).toMatchObject({ muscle_group: 'glutes', secondary_muscles: ['quadriceps'] }),
    )
  })

  it('shows the conflict message when deleting an exercise in use', async () => {
    server.use(
      http.get(apiUrl('/gym/exercises'), () => HttpResponse.json([created])),
      http.delete(apiUrl('/gym/exercises/7'), () =>
        HttpResponse.json({ detail: 'Exercise is referenced by a routine or session' }, { status: 409 }),
      ),
    )
    const { user } = renderApp({ route: '/gym/exercises' })

    await user.click(await screen.findByRole('button', { name: 'Eliminar Back squat' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() =>
      expect(screen.getByText('Exercise is referenced by a routine or session')).toBeInTheDocument(),
    )
  })
})
