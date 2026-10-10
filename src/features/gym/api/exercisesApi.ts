import { api, unwrap } from '@/shared/api/client'
import type { Exercise, ExerciseCreate, ExerciseUpdate } from './types'

const byId = (id: number) => ({ params: { path: { exercise_id: id } } })

export const exercisesApi = {
  list: (): Promise<Exercise[]> => unwrap(api.GET('/gym/exercises')),
  get: (id: number): Promise<Exercise> => unwrap(api.GET('/gym/exercises/{exercise_id}', byId(id))),
  create: (body: ExerciseCreate): Promise<Exercise> => unwrap(api.POST('/gym/exercises', { body })),
  update: (id: number, body: ExerciseUpdate): Promise<Exercise> =>
    unwrap(api.PATCH('/gym/exercises/{exercise_id}', { ...byId(id), body })),
  remove: async (id: number): Promise<void> => {
    await unwrap(api.DELETE('/gym/exercises/{exercise_id}', byId(id)))
  },
  uploadPhoto: (id: number, file: File): Promise<Exercise> =>
    unwrap(
      api.PUT('/gym/exercises/{exercise_id}/photo', {
        ...byId(id),
        // The generated type models the file as a string; the real payload is multipart.
        body: { photo: file as unknown as string },
        bodySerializer: (body) => {
          const form = new FormData()
          form.append('photo', body.photo as unknown as File)
          return form
        },
      }),
    ),
  /** The photo endpoint needs the bearer token, so it is fetched as a blob. */
  fetchPhoto: async (id: number): Promise<Blob> => {
    const blob = await unwrap(api.GET('/gym/exercises/{exercise_id}/photo', { ...byId(id), parseAs: 'blob' }))
    return blob as Blob
  },
  removePhoto: (id: number): Promise<Exercise> =>
    unwrap(api.DELETE('/gym/exercises/{exercise_id}/photo', byId(id))),
}
